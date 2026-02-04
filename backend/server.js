import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import morgan from 'morgan';
import cookieParser from 'cookie-parser'; // 1. የተረሳው import እዚህ ተጨምሯል
import helmet from 'helmet';            // ለደህንነት (Security headers)
import rateLimit from 'express-rate-limit'; // ለ Brute-force መከላከያ
import authRoutes from './routes/authRoutes.js';
import pool from './config/db.js';

dotenv.config();
const app = express();

// --- 1. Security & Logging Middleware ---
app.use(helmet()); // የሰርቨሩን የደህንነት headers ያስተካክላል
app.use(morgan('dev')); 
app.use(express.json());
app.use(cookieParser()); // 2. አሁን በትክክል ይሰራል

// --- 2. Rate Limiting (ከመጠን በላይ ጥያቄዎችን ለመከላከል) ---
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 ደቂቃ
    max: 100, // ከአንድ IP በ15 ደቂቃ ውስጥ 100 ጥያቄ ብቻ
    message: 'በጣም ብዙ ጥያቄ አቅርበዋል፣ እባክዎ ከጥቂት ደቂቃዎች በኋላ ይሞክሩ'
});
app.use('/api/', limiter);

// --- 3. CORS Configuration ---
app.use(cors({
    origin: ['http://localhost:5173', // የFrontend አድራሻህ
            'http://192.168.137.1:5173'],// yslk ip adress
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'], // OPTIONS መጨመሩን አረጋግጥ
    allowedHeaders: ['Content-Type', 'Authorization']
}));

// --- 4. API Health Check ---
app.get('/api/health', async (req, res) => {
    try {
        const connection = await pool.getConnection();
        await connection.query('SELECT 1'); 
        connection.release();
        
        res.status(200).json({
            status: 'UP',
            message: 'ሰርቨሩ እና MySQL ዳታቤዙ በሰላም እየሰሩ ነው',
            timestamp: new Date().toISOString(),
            database: 'Connected'
        });
    } catch (error) {
        res.status(500).json({
            status: 'DOWN',
            message: 'የዳታቤዝ ግንኙነት ተቋርጧል',
            error: error.message
        });
    }
});

// --- 5. Routes ---
app.use('/api/auth', authRoutes);

// --- 6. 404 Not Found Handler ---
app.use((req, res) => {
    res.status(404).json({ success: false, message: "የጠየቁት መንገድ (Route) አልተገኘም" });
});

// --- 7. Global Error Logging (የተሻሻለ) ---
app.use((err, req, res, next) => {
    console.error(`[ERROR] ${new Date().toISOString()}: ${err.message}`);
    if (process.env.NODE_ENV !== 'production') {
        console.error(err.stack); // በዴቨሎፕመንት ጊዜ ብቻ ዝርዝሩን አሳይ
    }

    res.status(err.status || 500).json({
        success: false,
        message: err.message || "የውስጥ ሰርቨር ስህተት ገጥሟል",
        // በፕሮዳክሽን ላይ ስህተቱን ለተጠቃሚው አንገልጽም
        stack: process.env.NODE_ENV === 'production' ? null : err.stack 
    });
});

const PORT = process.env.PORT || 5000;
const HOST = '0.0.0.0';
app.listen(PORT, () => {
    console.log(`-----------------------------------------`);
    console.log(`🚀 ሰርቨር በፖርት ${HOST}:${PORT} ላይ ተነስቷል`);
    console.log(`📡 Health Check: http://localhost:${HOST}:${PORT}/api/health`);
    console.log(`-----------------------------------------`);
});