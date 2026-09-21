import { app } from './app.js';
import { env } from './config/env.js';
import { prisma } from './config/prisma.js';
import { paymentService } from './services/payment.service.js';
import { logger } from './utils/logger.js';

const server = app.listen(env.PORT, () => {
  logger.info('server_started', { port: env.PORT, environment: env.NODE_ENV });
});

let cleanupRunning = false;
async function cleanupExpiredPaymentSessions() {
  if (cleanupRunning) return;
  cleanupRunning = true;
  try {
    await paymentService.cleanupExpiredSessions();
  } catch (error) {
    logger.error('payment_session_cleanup_failed', { error: error instanceof Error ? error.message : String(error) });
  } finally {
    cleanupRunning = false;
  }
}

// Abandoned payment windows must release reserved stock even if that customer
// never returns to the site. Run once after startup and then once per minute.
const cleanupTimer = setInterval(() => void cleanupExpiredPaymentSessions(), 60_000);
cleanupTimer.unref();
setTimeout(() => void cleanupExpiredPaymentSessions(), 5_000).unref();

let shuttingDown = false;
async function shutdown(signal: string) {
  if (shuttingDown) return;
  shuttingDown = true;
  logger.info('shutdown_started', { signal });
  clearInterval(cleanupTimer);
  server.close(async () => {
    await prisma.$disconnect();
    process.exit(0);
  });
  setTimeout(() => { logger.error('shutdown_forced', { signal }); process.exit(1); }, 10_000).unref();
}

process.on('unhandledRejection', reason => logger.error('unhandled_rejection', { error: reason instanceof Error ? reason.message : String(reason) }));
process.on('uncaughtException', error => { logger.error('uncaught_exception', { error: error.message, stack: error.stack }); void shutdown('uncaughtException'); });

process.on('SIGINT', () => void shutdown('SIGINT'));
process.on('SIGTERM', () => void shutdown('SIGTERM'));
