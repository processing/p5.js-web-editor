import rp from 'request-promise';

import config from '../config';

export function getP5Version(req, res) { // eslint-disable-line
  rp({ uri: config.p5versionURL, json: true })
    .then(response => res.json(response));
}
