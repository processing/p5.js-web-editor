import Express from 'express';

import { renderPreviewIndex } from './views/previewIndex';

const app = new Express();

app.get('/', (req, res) => {
  res.send(renderPreviewIndex());
});

app.listen(process.env.PREVIEW_PORT, (error) => {
  if (!error) {
    console.log(`p5.js Preview Server is running on port: ${process.env.PREVIEW_PORT}`)
  }
});

export default app;
