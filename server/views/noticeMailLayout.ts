import { NoticeEmailTemplate } from '../types/email';

/**
 * Returns mjml for an informational email with no action button or link.
 * Used for security notices and one-time codes, where including a clickable
 * link acting on the account would be an unnecessary risk.
 */
export const noticeMailLayout = ({
  domain,
  headingText,
  greetingText,
  messageText,
  highlightText,
  noteText,
  meta
}: NoticeEmailTemplate) =>
  `
<mjml>
  <mj-head>
    <mj-raw>
      <meta name="keywords" content="${meta.keywords}" />
      <meta name="description" content="${meta.description}" />
    </mj-raw>
  </mj-head>
  <mj-body>
      <mj-section>
        <mj-column>
          <mj-image width="192px" src="${domain}/images/p5js-square-logo.png" alt="p5.js" />
          <mj-divider border-color="#ed225d"></mj-divider>
        </mj-column>
      </mj-section>

      <mj-section>
        <mj-column>
          <mj-text font-size="20px" color="#333333" font-family="sans-serif">
            ${headingText}
          </mj-text>
        </mj-column>
      </mj-section>

      <mj-section>
        <mj-column>
          <mj-text color="#333333">
            ${greetingText}
          </mj-text>
          <mj-text color="#333333">
            ${messageText}
          </mj-text>
          ${
            highlightText
              ? `<mj-text align="center" font-size="32px" letter-spacing="8px" color="#333333" font-family="monospace">
            ${highlightText}
          </mj-text>`
              : ''
          }
          <mj-text color="#333333">
            ${noteText}
          </mj-text>
        </mj-column>
      </mj-section>
  </mj-body>
</mjml>
`;
