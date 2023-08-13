import { ApplicationService, container } from '#application/index.js';
import { type Logger, TYPES } from '#features/common/index.js';

const app = await container.getAsync<ApplicationService>(ApplicationService);
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
