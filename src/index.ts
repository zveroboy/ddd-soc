import { container } from '#bootstrap/index.js';

import { Application } from './application.js';

const app = await Application.create(container);
app.start();

process.on('exit', (code) => {
  console.log(`Caught exit ${code}`);
});

/**
 * @todo consider other signals
 */
process.on('SIGINT', async () => {
  await app.destroy();
  process.exit();
});
