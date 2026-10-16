import { dropE2eDatabase } from './drop-e2e-db';

export default async function globalSetup() {
  await dropE2eDatabase();
}
