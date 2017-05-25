export default ({ link }) => (
`
<mjml>
  <mj-body>
    <mj-container>
      <mj-section>
        <mj-column>
          <mj-image width="100" src="/assets/img/logo-small.png"></mj-image>

          <mj-divider border-color="#ed225d"></mj-divider>

          <mj-text font-size="20px" color="#333333" font-family="sans-serif">
            Reset your password
          </mj-text>

          <mj-text color="#333333">
            Hello,
          </mj-text>
          <mj-text color="#333333">
            We received a request to reset the password for your account. To reset your password, click on the button below:
          </mj-text>
          <mj-button background-color="#ed225d" href="${link}">
            Reset password
          </mj-button>
        </mj-column>
      </mj-section>

      <mj-section>
        <mj-column>
          <mj-text color="#333333">Or copy and paste the URL into your browser:</mj-text>
          <mj-text align="center" color="#333333"><a href="${link}">${link}</a></mj-text>
        </mj-column>
      </mj-section>

    </mj-container>
  </mj-body>
</mjml>
`
);
