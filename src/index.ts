import App from './app';

const server = new App();

server.start().catch((error) => {
  console.error('Error starting application:', error);
  process.exit(1);
});

// Handle graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM received. Shutting down gracefully...');
  await server.shutdown();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('SIGINT received. Shutting down gracefully...');
  await server.shutdown();
  process.exit(0);
});