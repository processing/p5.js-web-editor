import type { BrowserContext, Page } from '@playwright/test';
import { test, expect } from '../fixtures';
import { dismissCookieBanner } from '../helpers/cookie-banner';

test.describe('editor page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');

    // initial pageload check to fail fast:
    await expect(page.locator('a.skip_link[href="#play-sketch"]')).toHaveText(
      'Skip to Play Sketch'
    );

    await dismissCookieBanner(page);

    // wait for page to fully load with all main IDE components:
    await expect(page.locator('#play-sketch')).toBeVisible(); // play button
    await expect(page.locator('iframe[title="sketch preview"]')).toBeVisible(); // sketch preview
    await expect(page.locator('.preview-console')).toBeVisible(); // editor console
    await expect(page.locator('.editor-holder')).toBeVisible(); // editor -- NOTE: .editor-holder .CodeMirror cannot be found on CI for some reason, so we are using .editor-holder instead.
  });

  test('can run sketch code written in the editor', async ({ page }) => {
    const LOG = 'hi from sketch';
    const FRAME_RATE = 10;

    const newCode = [
      'function setup() {',
      '  createCanvas(400, 400);',
      ` frameRate(${FRAME_RATE});`,
      '}',
      '',
      'function draw() {',
      '  background(220);',
      `  console.log('${LOG}');`,
      '}'
    ].join(''); // Purposely joining without '\n' to avoid triggering the autocomplete with keyboard.type & creating extra brackets

    // Find editor text area, clear default code & type in the new code
    const editor = page.locator('.editor-holder');
    await editor.click();
    await page.keyboard.press('ControlOrMeta+A');
    await page.keyboard.type(newCode, { delay: 5 }); // Purposely using .type instead of .insert (.insert does not work with the redux state management)

    const logRow = page
      .locator('.preview-console__messages [data-method="log"]')
      .filter({ hasText: LOG });

    // Confirm count starts as 0, before the sketch has run at all
    await expect(logRow).toHaveCount(0);

    // Click Play (start the loop)
    await page.locator('#play-sketch').click({ force: true });

    // Wait for the sketch iframe src to confirm the sketch actually started
    await expect(
      page.locator('iframe[title="sketch preview"]')
    ).toHaveAttribute('src', /9002/, { timeout: 10_000 });

    // Assert console output
    await expect(page.locator('.preview-console__messages')).toContainText(
      LOG,
      { timeout: 15_000 }
    );

    // Let sketch run for 2 seconds
    await page.waitForTimeout(2000);

    // Stop the sketch
    await page.locator('[aria-label="Stop sketch"]').click();

    const countDiv = logRow.last().locator('div').first();
    const count = Number(await countDiv.textContent());

    // Confirm count is ~20 frames. Wide tolerance: exact frame count depends
    // on browser/CI scheduling, not just frameRate(10) math.
    expect(count).toBeGreaterThan(15);
    expect(count).toBeLessThan(30);

    // Wait and confirm count did not increase
    await page.waitForTimeout(1000);
    await expect(countDiv).toHaveText(count.toString());
  });

  test('unauthenticated users cannot save sketches', async ({ page }) => {
    // Verify save option is disabled in File menu
    await page.getByRole('menuitem', { name: 'File' }).click();

    const saveButton = page.locator('#file-save');

    await expect(saveButton).toHaveAttribute('aria-disabled', 'true');
    await expect(saveButton).toHaveAttribute(
      'aria-label',
      'Log in to save your sketch'
    );

    // Close menu if needed
    await page.keyboard.press('Escape');

    // Attempt save via keyboard shortcut
    await page.locator('.editor-holder').click();
    // 'Control' (not ControlOrMeta): the app's isMac() checks the user agent,
    // which the Desktop Chrome device emulates as Windows — so the app-level
    // save shortcut expects Ctrl+S on every host, including Macs.
    await page.keyboard.press('Control+S');

    // Verify login prompt appears
    await expect(
      page.getByText(
        'In order to save sketches, you must be logged in. Please Login or Sign Up.'
      )
    ).toBeVisible();
  });

  test.describe('nav dropdown redirects', () => {
    // Reused by the two Help items that open an external link in a new tab.
    const expectHelpLinkOpensNewTab = async (
      page: Page,
      context: BrowserContext,
      locatorId: string,
      urlSubstring: string
    ) => {
      await page.getByRole('menuitem', { name: 'Help' }).click();
      const [newTab] = await Promise.all([
        context.waitForEvent('page'),
        page.locator(locatorId).click()
      ]);
      await newTab.waitForLoadState();
      expect(newTab.url()).toContain(urlSubstring);
      await newTab.close();
    };

    test('File > Examples opens in the same tab', async ({ page }) => {
      await page.getByRole('menuitem', { name: 'File' }).click();
      await page.locator('#file-examples').click();
      await expect(page).toHaveURL(/\/p5\/sketches/, { timeout: 10_000 });
    });

    test('Help > About opens in the same tab', async ({ page }) => {
      await page.getByRole('menuitem', { name: 'Help' }).click();
      await page.locator('#help-about').click();
      await expect(page).toHaveURL(/\/about/, { timeout: 10_000 });
    });

    test('Help > Reference opens in a new tab', async ({ page, context }) => {
      await expectHelpLinkOpensNewTab(
        page,
        context,
        '#help-reference',
        'p5js.org/reference'
      );
    });

    test('Help > Post on the Forum opens in a new tab', async ({
      page,
      context
    }) => {
      await expectHelpLinkOpensNewTab(
        page,
        context,
        '#help-forum',
        'discourse.processing.org/c/p5js/10'
      );
    });
  });

  test('User can create a functioning sketch with multiple files', async ({
    page
  }) => {
    await page
      .locator('button[aria-label="Open Sketch files navigation"]')
      .click();

    await page
      .locator('button[aria-label="Toggle open/close sketch file options"]')
      .click();

    await page.locator('button[aria-label="add file"]').click();

    await page.locator('.new-file-form__name-input').fill('fileA.js');

    await page.keyboard.press('Enter');

    const fileACode = [
      'function fileA(){',
      '  console.log("log from file A");',
      '}'
    ].join('');

    await page.waitForTimeout(1000);

    await page.locator('.editor-holder').click();
    await page.keyboard.type(fileACode, { delay: 5 });

    // Wait for CodeMirror's debounced onChange (1000ms) to commit this
    // file's content to Redux before switching tabs. The debounce reads
    // "current file" at fire time, not at schedule time, so switching away
    // too early makes the pending save misfire against whichever file is
    // active when the timer eventually runs, silently dropping this edit.
    await page.waitForTimeout(1000);

    // Register the new file in index.html
    await page.locator('button[aria-label="index.html"]').click();
    await page.locator('.editor-holder').click();
    await page.keyboard.press('ControlOrMeta+F');
    await page.keyboard.type('<script src="sketch.js"></script>');
    await page.keyboard.press('Enter'); // find it
    // Close via the panel's own close button rather than Escape: Escape
    // routes through CodeMirror's search keymap first, which only clears
    // CM's internal search state and leaves this panel on-screen still
    // holding focus, so subsequent keystrokes would land in the search
    // field instead of the editor.
    await page.getByRole('button', { name: 'close', exact: true }).click();
    await expect(page.locator('.cm-search-panel')).toBeHidden();

    // Move to end of that line and add new line
    await page.keyboard.press('End');
    await page.keyboard.press('Enter');
    // Autocorrect takes care of the closing </script> tag
    await page.keyboard.type('<script src="fileA.js">', { delay: 5 });

    await page.waitForTimeout(1000);

    await page.locator('button[aria-label="sketch.js"]').click();

    const sketchCode = [
      'function setup() {',
      '  createCanvas(400, 400);',
      '  fileA();',
      '}',
      '',
      'function draw() {',
      '  background(220);',
      '}'
    ].join('');

    await page.locator('.editor-holder').click();
    await page.keyboard.press('ControlOrMeta+A');
    await page.keyboard.type(sketchCode, { delay: 5 });

    await page.waitForTimeout(1000);

    // Click Play
    await page.locator('#play-sketch').click({ force: true });

    // Wait for the sketch iframe src to confirm the sketch actually started
    await expect(
      page.locator('iframe[title="sketch preview"]')
    ).toHaveAttribute('src', /9002/, { timeout: 10_000 });

    // Assert console output
    await expect(
      page.locator('.preview-console__messages')
    ).toContainText('log from file A', { timeout: 15_000 });

    page.on('dialog', (dialog) => dialog.accept());

    // Open the file options for fileA.js
    const fileItem = page
      .locator('.file-item__content')
      .filter({ has: page.locator('button[aria-label="fileA.js"]') });
    await fileItem.click();
    await fileItem
      .locator('button[aria-label="Toggle open/close file options"]')
      .click();

    // Delete the file
    await fileItem
      .locator('button.sidebar__file-item-option')
      .filter({ hasText: 'Delete' })
      .click();
    await expect(
      page
        .locator('.file-item__content')
        .filter({ has: page.locator('button[aria-label="fileA.js"]') })
    ).toHaveCount(0);

    // Play sketch again and verify that the console output from the deleted file is gone
    await page.locator('#play-sketch').click({ force: true });

    // Check for the error message in the console indicating that fileA is not defined
    await expect(
      page.locator('.preview-console__messages')
    ).toContainText('fileA is not defined', { timeout: 15_000 });
  });

  test('user can create a functioning sketch with folders', async ({
    page
  }) => {
    await page
      .locator('button[aria-label="Open Sketch files navigation"]')
      .click();

    await page
      .locator('button[aria-label="Toggle open/close sketch file options"]')
      .click();

    await page.locator('button[aria-label="add folder"]').click();

    await page.locator('.new-folder-form__name-input').fill('folderA');

    await page.keyboard.press('Enter');

    // Open folder options
    await page
      .locator('button[aria-label="folderA"]')
      .locator('..')
      .locator('button[aria-label="Toggle open/close file options"]')
      .click();

    // Click Create file
    await page
      .locator('button[aria-label="folderA"]')
      .locator('..')
      .locator('button[aria-label="add file"]')
      .click();

    await page.locator('.new-file-form__name-input').fill('fileA.js');

    await page.keyboard.press('Enter');

    const fileACode = [
      'function fileA(){',
      '  console.log("log from file A");',
      '}'
    ].join('');

    await page.waitForTimeout(1000);

    await page.locator('.editor-holder').click();
    await page.keyboard.type(fileACode, { delay: 5 });

    // Wait for CodeMirror's debounced onChange (1000ms) to commit this
    // file's content to Redux before switching away
    await page.waitForTimeout(1000);

    // Create a second, separate folder for fileB.js — this exercises
    // resolvePathToFile() actually respecting folder boundaries (folderA
    // vs folderB), not just matching a filename found anywhere in the tree.
    await page
      .locator('button[aria-label="Toggle open/close sketch file options"]')
      .click();

    // "add folder" also exists (hidden) as folderA's own per-item option for
    // creating a subfolder inside it — scope to the visible one to avoid a
    // strict-mode ambiguity now that folderA exists.
    await page.locator('button[aria-label="add folder"]:visible').click();

    await page.locator('.new-folder-form__name-input').fill('folderB');

    await page.keyboard.press('Enter');

    // The options button is only revealed on hover of the file item row
    await page.locator('button[aria-label="folderB"]').hover();

    // Open folder options for folderB
    await page
      .locator('button[aria-label="folderB"]')
      .locator('..')
      .locator('button[aria-label="Toggle open/close file options"]')
      .click();

    // Click Create file
    await page
      .locator('button[aria-label="folderB"]')
      .locator('..')
      .locator('button[aria-label="add file"]')
      .click();

    await page.locator('.new-file-form__name-input').fill('fileB.js');

    await page.keyboard.press('Enter');

    const fileBCode = [
      'function fileB(){',
      '  console.log("log from file B");',
      '}'
    ].join('');

    await page.waitForTimeout(1000);

    await page.locator('.editor-holder').click();
    await page.keyboard.type(fileBCode, { delay: 5 });

    // Same debounce wait as above, before switching to index.html
    await page.waitForTimeout(1000);

    // Register the new files in index.html
    await page.locator('button[aria-label="index.html"]').click();
    await page.locator('.editor-holder').click();

    await page.keyboard.press('ControlOrMeta+F');
    await page.keyboard.type('<script src="sketch.js"></script>');
    await page.keyboard.press('Enter'); // find it
    // Close via the panel's own close button rather than Escape: Escape
    // routes through CodeMirror's search keymap first, which only clears
    // CM's internal search state and leaves this panel on-screen still
    // holding focus, so subsequent keystrokes would land in the search
    // field instead of the editor.
    await page.getByRole('button', { name: 'close', exact: true }).click();
    await expect(page.locator('.cm-search-panel')).toBeHidden();

    // Move to end of that line and add new line
    await page.keyboard.press('End');
    await page.keyboard.press('Enter');
    // fileA.js and fileB.js live in separate folders, so each src needs its
    // own folder-relative path — resolvePathToFile() (server/utils/filePath.js)
    // walks from the sketch root by name at each path segment, it doesn't
    // search recursively, so a bare filename won't resolve to a nested file.
    // Autocorrect takes care of the closing </script> tag
    await page.keyboard.type('<script src="folderA/fileA.js"></script>', {
      delay: 5
    });
    await page.keyboard.press('Enter');
    // Autocorrect takes care of the closing </script> tag
    await page.keyboard.type('<script src="folderB/fileB.js">', {
      delay: 5
    });

    await page.waitForTimeout(1000);

    // fileB() is called first: later, after folderA is deleted, fileA()
    // throws and halts setup() — calling it second means fileB() still
    // runs and logs before that happens, so we can verify folderB's file
    // survives folderA's deletion instead of never being reached at all.
    const sketchCode = [
      'function setup() {',
      '  createCanvas(400, 400);',
      '  fileB();',
      '  fileA();',
      '}',
      '',
      'function draw() {',
      '  background(220);',
      '}'
    ].join('');

    await page.locator('button[aria-label="sketch.js"]').click();

    await page.locator('.editor-holder').click();
    await page.keyboard.press('ControlOrMeta+A');
    await page.keyboard.type(sketchCode, { delay: 5 });

    await page.waitForTimeout(1000);

    // Click Play
    await page.locator('#play-sketch').click({ force: true });

    // Wait for the sketch iframe src to confirm the sketch actually started
    await expect(
      page.locator('iframe[title="sketch preview"]')
    ).toHaveAttribute('src', /9002/, { timeout: 10_000 });

    // Assert console output
    await expect(
      page.locator('.preview-console__messages')
    ).toContainText('log from file A', { timeout: 15_000 });
    await expect(
      page.locator('.preview-console__messages')
    ).toContainText('log from file B', { timeout: 15_000 });

    page.on('dialog', (dialog) => dialog.accept());

    // Open the file options for fileA.js
    const folderItem = page
      .locator('.file-item__content')
      .filter({ has: page.locator('button[aria-label="folderA"]') });
    await folderItem.hover();
    await folderItem
      .locator('button[aria-label="Toggle open/close file options"]')
      .click();

    // Delete the folder
    await folderItem
      .locator('button.sidebar__file-item-option')
      .filter({ hasText: 'Delete' })
      .click();
    await expect(
      page
        .locator('.file-item__content')
        .filter({ has: page.locator('button[aria-label="folderA"]') })
    ).toHaveCount(0);

    // Play sketch again and verify that the console output from the deleted file is gone
    await page.locator('#play-sketch').click({ force: true });

    // Check for the error message in the console indicating that fileA is not defined
    await expect(
      page.locator('.preview-console__messages')
    ).toContainText('fileA is not defined', { timeout: 15_000 });

    // folderB/fileB.js should be untouched — deleting folderA shouldn't
    // affect its sibling folder
    await expect(
      page.locator('.preview-console__messages')
    ).toContainText('log from file B', { timeout: 15_000 });
  });
});
