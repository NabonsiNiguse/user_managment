// config/db.js
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

// Create connection pool
const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASS || '',
    database: process.env.DB_NAME || 'user_managment',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Test connection
try {
    const connection = await pool.getConnection();
    console.log('✅ Database connected successfully');
    connection.release();
} catch (error) {
    console.error('❌ Database connection failed:', error.message);
    process.exit(1);
}

export default pool;