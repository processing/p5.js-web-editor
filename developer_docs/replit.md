A guide to running the P5.js Web Editor on Replit.com

## What is Replit.com

Replit.com is a online integrated development environment that makes it possible to write code in a wide array of languages and run it for free in a cloud hosted environment.

## Replit Configuration Files

There are number of configuration files in this repository that are explicitly for supporting Replit.com:

 * [.replit](#.replit) - Configuration for the Replit.com interface including type checking in the editor, and how the [▸ Run] button works.
 * [replit.nix](#replit.nix) - Configuration for the Nix.os container that the code of this Repl runs in (namely installation of dependencies).

## Setup Steps

In order for the P5.js Web Editor to start you need to add certain secret environment variables. You can add these to your Repl one by one in the Secrets tab, or you can use the raw editor to add and modify the following JSON:

```json
{
  "AWS_ACCESS_KEY": "<your-aws-key>",
  "AWS_REGION": "<your-aws-region>",
  "AWS_SECRET_KEY": "<your-aws-secret-key>",
  "EMAIL_SENDER": "<transactional-email-sender>",
  "GITHUB_ID": "<your-github-client-id>",
  "GITHUB_SECRET": "<your-github-client-secret>",
  "GOOGLE_ID": "<your-google-client-id> (use google+ api)",
  "GOOGLE_SECRET": "<your-google-client-secret> (use google+ api)",
  "MAILGUN_DOMAIN": "<your-mailgun-domain>",
  "MAILGUN_KEY": "<your-mailgun-api-key>",
  "S3_BUCKET": "<your-s3-bucket>",
  "S3_BUCKET_URL_BASE": "<alt-for-s3-url>"
}
```

You can optionally follow the setup steps for each of these third party services in order to enable to functionality that depends on them.

## Third Party Services [Optional]

### Amazon Web Services (AWS)

### Amazon S3 Storage

### Github

### Google+ API

### Mailgun