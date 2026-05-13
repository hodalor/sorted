const dotenv = require('dotenv');

const app = require('./app');
const connectDb = require('./config/connectDb');

dotenv.config();

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  await connectDb();

  app.listen(PORT, () => {
    console.log(`Sorted backend listening on port ${PORT}`);
  });
};

startServer();
