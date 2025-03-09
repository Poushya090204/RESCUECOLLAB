import ConnectDB from "./config/db.js";
import app from './app.js'
import dotenv from 'dotenv';
import cors from "cors";

// Handling Uncaught Exception
process.on('uncaughtException', (err) => {
  console.log(`Error: ${err.message}`);
  console.log(`Shutting server due to uncaught exception`);
  process.exit(1);
});

app.use(cors());

// Config
dotenv.config();

// Connect to MongoDB
ConnectDB();

// PORT
const PORT = process.env.PORT || 5000;

// Firing server
const server = app.listen(PORT, () => {
  console.log(`Server is Running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});

// Unhandled Promise Rejection
process.on('unhandledRejection', err => {
  console.log(`Error: ${err.message}`);
  console.log(`Shutting down the server due to unhandled Rejection`);
  server.close(() => {
    process.exit(1);
  });
});
