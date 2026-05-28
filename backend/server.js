import express from 'express';
import helmet from 'helmet';
import morgan from 'morgan';
import cors from 'cors';
import dotenv from 'dotenv';

import productRoutes from './routes/productRoutes.js';
import { sql } from './config/db.js';
import { aj } from './lib/arcjet.js';
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(cors());
//helmet helps secure the app by setting various HTTP headers
app.use(helmet());
// morgan helps log HTTP requests in the console for debugging purposes
app.use(morgan('dev'));

app.use(async (req, res, next) => {

    try {
        const decision = await aj.protect(req, {
            requested: 1
        });

        if (decision.isDenied()) {
            if (decision.reason.isRateLimit()) {

                return res.status(429).json({
                    error: "Too many requests. Please try again later."
                });
            }
            else if (decision.reason.isBot()) {

                return res.status(403).json({
                    error: "Access denied. Bot traffic is not allowed."
                });
            }
            else {

                return res.status(403).json({
                    error: "Access denied. Your request was blocked by Arcjet."
                });
            }
        }
        next();
    } catch (error) {
        console.error("Arcjet Error:", error);
        next();
    }
});

app.use("/api/products", productRoutes);


async function initDB() {
    try {
        await sql`
            CREATE TABLE  IF NOT EXISTS products (
                id SERIAL PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                image VARCHAR(255) NOT NULL,
                price DECIMAL(10, 2) NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `;
        console.log('Database initialized successfully');
    }
    catch (error) {
        console.error('Error initializing database:', error);
    }
}

initDB().then(() => {
    app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
    });
});

