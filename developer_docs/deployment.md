# Deployment

WIP.
* Production Setup/Installation
* Travis
* Docker Hub
* Kubernetes
* S3
* Mailgun
* Cloudflare
* DNS/Dreamhost
* mLab

## Production Installation
1. Clone this repository and `cd` into it
2. `$ npm install`
3. Install MongoDB and make sure it is running
4. `$ cp .env.example .env`
5. (NOT Optional) edit `.env` and fill in all necessart values.
6. `$ npm run fetch-examples` - this downloads the example sketches into a user called 'p5'
7. `$ npm run build`
8. `$ npm run start:prod`
