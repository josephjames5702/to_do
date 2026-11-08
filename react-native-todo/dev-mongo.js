// Dev-only: runs a real mongod on 127.0.0.1:27017 with data persisted in ./.mongo-data
// (no system install needed). Point the existing server at it with:
//   MONGO_URI=mongodb://127.0.0.1:27017/todo_app
const fs = require('fs');
const path = require('path');
const { MongoMemoryServer } = require('mongodb-memory-server');

const dbPath = path.join(__dirname, '.mongo-data');
fs.mkdirSync(dbPath, { recursive: true });

MongoMemoryServer.create({
  instance: { port: 27017, ip: '127.0.0.1', dbPath, storageEngine: 'wiredTiger' },
})
  .then((mongod) => {
    console.log(`MongoDB ready: ${mongod.getUri()}todo_app`);
    const stop = async () => {
      await mongod.stop({ doCleanup: false });
      process.exit(0);
    };
    process.on('SIGINT', stop);
    process.on('SIGTERM', stop);
  })
  .catch((e) => {
    console.error('Failed to start MongoDB:', e.message);
    process.exit(1);
  });
