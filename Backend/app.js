import express from "express";
import cors from "cors";
import agencyRoutes from './routes/agencyRoutes.js';
import alertRoutes from './routes/alertRoutes.js';
import disasterRoutes from './routes/disasterRoutes.js';
import resourceRoutes from './routes/resourceRoutes.js';

const app = express();

// Middlewares
app.use(express.json());
app.use(cors()); // Configure CORS as needed

// Routes
app.use('/agency', agencyRoutes);
app.use('/alert', alertRoutes);
app.use('/disaster', disasterRoutes);
app.use('/resource', resourceRoutes);

// Rest API  
app.get('/', (req, res) => {
  res.send("<h1>Welcome to Rescue Connect</h1>");
});

// Global Error Handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

export default app;
