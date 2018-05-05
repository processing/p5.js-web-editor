export default ({
  domain,
  headingText,
  greetingText,
  messageText,
  link,
  buttonText,
  directLinkText,
  noteText,
}) => (
  `
<mjml>
  <mj-body>
    <mj-container>
      <mj-section>
        <mj-column>
          <mj-image width="192" src="${domain}/images/p5js-square-logo.png" alt="p5.js" />
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
          <mj-button background-color="#ed225d" href="${link}">
            ${buttonText}
          </mj-button>
        </mj-column>
      </mj-section>

      <mj-section>
        <mj-column>
          <mj-text color="#333333">
            ${directLinkText}
          </mj-text>
          <mj-text align="center" color="#333333"><a href="${link}">${link}</a></mj-text>
          <mj-text color="#333333">
            ${noteText}
          </mj-text>
        </mj-column>
      </mj-section>
    </mj-container>
  </mj-body>
</mjml>
`
);
