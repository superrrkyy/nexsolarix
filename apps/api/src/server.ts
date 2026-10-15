import { app } from './app.js';

const port = Number(process.env.PORT ?? 4000);
const server = app.listen(port, '0.0.0.0', () => {
  console.log(JSON.stringify({ level: 'info', message: 'NexSolarix API listening', port, mode: process.env.NODE_ENV ?? 'development' }));
});

const shutdown = (signal: string) => {
  console.log(JSON.stringify({ level: 'info', message: 'API shutdown requested', signal }));
  server.close(() => process.exit(0));
};

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));
