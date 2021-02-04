export function renderPreviewIndex() {
  return `
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body>
        <div id="root" class="root-app">
          <script src="/preview-app.js"></script>
        </div>
      </body>
    </html>
  `;
}