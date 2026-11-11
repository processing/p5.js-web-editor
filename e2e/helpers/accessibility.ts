import AxeBuilder from '@axe-core/playwright';
import type { Page } from '@playwright/test';
import type { AxeResults, Result, NodeResult } from 'axe-core';

/**
 * Runs the initial accessibility baseline against the current page.
 *
 * The selected tags intentionally cover WCAG 2.1 A/AA and axe best
 * practices. Violations are returned unchanged so callers can report them
 * without suppressing or altering the scan results.
 */
export async function runAccessibilityScan(page: Page): Promise<AxeResults> {
  return new AxeBuilder({ page })
    .withTags([
      'wcag2a',
      'wcag2aa',
      'wcag21a',
      'wcag21aa',
      'wcag22a',
      'wcag22aa',
      'best-practice'
    ])
    .analyze();
}
function formatNode(node: NodeResult): string {
  const target = node.target.join(', ');
  return `    target: ${target}\n    failure: ${node.failureSummary}`;
}

function formatViolation(violation: Result): string {
  const nodes = violation.nodes.map(formatNode).join('\n');

  return [
    `${violation.id} [${violation.impact ?? 'unknown'}]`,
    `  ${violation.help}`,
    `  ${violation.helpUrl}`,
    nodes
  ].join('\n');
}

/**
 * Formats all Axe violations for Playwright's assertion output and reports.
 */
export function formatAccessibilityViolations(
  violations: AxeResults['violations']
): string {
  if (violations.length === 0) {
    return 'No accessibility violations found.';
  }

  return [
    `Accessibility violations: ${violations.length}`,
    ...violations.map(formatViolation)
  ].join('\n');
}
