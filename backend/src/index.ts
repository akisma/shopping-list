/**
 * Main entry point for Shopping List API server
 */

import express from 'express';
import cors from 'cors';
import pino from 'pino';
import { SQLiteDatabase } from './db/sqlite';
import { ShoppingListService } from './services/shopping-list.service';
import { ShoppingListItemService } from './services/shopping-list-item.service';
import { ReminderService } from './services/reminder.service';
import { ShoppingListController } from './controllers/shopping-list.controller';
import { ShoppingListItemController } from './controllers/shopping-list-item.controller';
import { ReminderController } from './controllers/reminder.controller';
import { createShoppingListRoutes } from './routes/shopping-list.routes';
import { createItemRoutes } from './routes/item.routes';
import { createReminderRoutes } from './routes/reminder.routes';
import { errorHandler } from './middleware/error-handler';
import { getHealthStatus } from './utils/health';
import { join } from 'path';

// Configuration
const PORT = process.env.PORT || 3001;
const NODE_ENV = process.env.NODE_ENV || 'development';
const DB_PATH = process.env.DATABASE_PATH || join(__dirname, '../data/shopping-list.db');
const CORS_ORIGINS = process.env.CORS_ORIGINS?.split(',') || [
  'http://localhost:8081',
  'http://localhost:19000',
  'http://localhost:19006'
];

// Logger
const logger = pino({
  level: NODE_ENV === 'production' ? 'info' : 'debug',
  transport: NODE_ENV !== 'production' ? {
    target: 'pino-pretty',
    options: {
      colorize: true,
      translateTime: 'HH:MM:ss Z',
      ignore: 'pid,hostname'
    }
  } : undefined
});

// Initialize Express app
const app = express();

// Middleware
app.use(cors({
  origin: CORS_ORIGINS,
  credentials: true
}));
app.use(express.json());

// Request logging
app.use((req, _res, next) => {
  logger.info({ method: req.method, url: req.url }, 'Incoming request');
  next();
});

// Initialize database and services
const db = new SQLiteDatabase(DB_PATH);
const shoppingListService = new ShoppingListService(db);
const itemService = new ShoppingListItemService(db);
const reminderService = new ReminderService(db);

// Initialize controllers
const shoppingListController = new ShoppingListController(shoppingListService);
const itemController = new ShoppingListItemController(itemService);
const reminderController = new ReminderController(reminderService);

// Health check endpoint
app.get('/health', (_req, res) => {
  res.json(getHealthStatus());
});

// API routes
app.use('/api/v1/shopping-lists', createShoppingListRoutes(shoppingListController));
app.use('/api/v1/shopping-lists/:listId/items', createItemRoutes(itemController));
app.use('/api/v1/reminders', createReminderRoutes(reminderController));

// Error handling (must be last)
app.use(errorHandler(logger));

// Start server
const server = app.listen(PORT, () => {
  logger.info({ port: PORT, env: NODE_ENV }, 'Server started successfully');
});

// Graceful shutdown
const shutdown = () => {
  logger.info('Shutdown signal received, closing server...');
  server.close(() => {
    logger.info('Server closed');
    db.close();
    process.exit(0);
  });
};

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);
