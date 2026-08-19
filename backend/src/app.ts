import express, { type Express, type Request, type Response } from 'express';
import { InventoryRouter } from './routes/inventory.route.js';
import { ReceiptTypeRouter } from './routes/receipt-type.route.js';
import { globalErrorHandler, notFoundHandler } from './middlewares/error.middleware.js';

const app: Express = express();

// Middleware parsing JSON body
app.use(express.json());

app.get("/", (req: Request, res: Response) => {
  res.send('Hello World');
});

// API Routes
app.use("/api/v1/inventory", InventoryRouter);
app.use("/api/v1/receipt-types", ReceiptTypeRouter);

// Catch 404 Route Not Found
app.use(notFoundHandler);

// Global Error Handler (must be the last middleware)
app.use(globalErrorHandler);

app.listen(8000, () => {
  console.log('Server is running on port 8000');
});
