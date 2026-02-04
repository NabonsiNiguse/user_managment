import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import pool from '../config/db.js';
import asyncHandler from 'express-async-handler';

// --- HELPERS ---
const generateToken = (userId, role, secret, expiry) => {
    return jwt.sign({ id: userId, role }, secret, { expiresIn: expiry });
};

// --- 1. AUTHENTICATION LOGIC ---

/**
 * @desc    User Registration
 * @route   POST /api/auth/register
 */
export const register = asyncHandler(async (req, res) => {
    const { name, email, password } = req.body;
    const conn = await pool.getConnection();
    try {
        const [exists] = await conn.execute('SELECT id FROM users WHERE email = ?', [email]);
        if (exists.length > 0) {
            return res.status(400).json({ success: false, message: "ኢሜይሉ ቀደም ብሎ ተመዝግቧል" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        await conn.execute('INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)', 
            [name, email, hashedPassword, 'user']);

        res.status(201).json({ success: true, message: "ምዝገባው ተሳክቷል" });
    } finally {
        conn.release();
    }
});

/**
 * @desc    Login with Account Locking & HttpOnly Cookies
 * @route   POST /api/auth/login
 */
export const login = asyncHandler(async (req, res) => {
    const { email, password } = req.body;
    const conn = await pool.getConnection();

    try {
        const [users] = await conn.execute('SELECT * FROM users WHERE email = ?', [email]);
        if (users.length === 0) {
            return res.status(401).json({ success: false, message: "ኢሜይል ወይም ፓስወርድ ተሳስቷል" });
        }

        const user = users[0];

        // Check Account Lock
        if (user.locked_until && new Date(user.locked_until) > new Date()) {
            return res.status(423).json({ success: false, message: "አካውንትዎ ለጊዜው ተቆልፏል" });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            const attempts = user.failed_login_attempts + 1;
            let query = 'UPDATE users SET failed_login_attempts = ? WHERE id = ?';
            if (attempts >= 5) {
                query = 'UPDATE users SET failed_login_attempts = ?, locked_until = DATE_ADD(NOW(), INTERVAL 30 MINUTE) WHERE id = ?';
            }
            await conn.execute(query, [attempts, user.id]);
            return res.status(401).json({ success: false, message: "ኢሜይል ወይም ፓስወርድ ተሳስቷል" });
        }

        // Reset locking on success
        await conn.execute('UPDATE users SET failed_login_attempts = 0, locked_until = NULL WHERE id = ?', [user.id]);

        const accessToken = generateToken(user.id, user.role, process.env.JWT_SECRET, '15m');
        const refreshTokenValue = generateToken(user.id, null, process.env.JWT_REFRESH_SECRET, '7d');

        // Save Refresh Token to DB
        await conn.execute('DELETE FROM refresh_tokens WHERE user_id = ?', [user.id]);
        await conn.execute('INSERT INTO refresh_tokens (user_id, token, expires_at) VALUES (?, ?, DATE_ADD(NOW(), INTERVAL 7 DAY))', 
            [user.id, refreshTokenValue]);

        // Send HttpOnly Cookie
        res.cookie('refreshToken', refreshTokenValue, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 7 * 24 * 60 * 60 * 1000
        });

        res.json({ 
            success: true, 
            data: { 
                accessToken, 
                user: { id: user.id, name: user.name, role: user.role } 
            } 
        });
    } finally {
        conn.release();
    }
});

/**
 * @desc    Refresh Access Token using Cookie
 * @route   POST /api/auth/refresh-token
 */
export const refreshToken = asyncHandler(async (req, res) => {
    const token = req.cookies.refreshToken;

    if (!token) return res.status(401).json({ success: false, message: "Unauthorized - No Token" });

    const conn = await pool.getConnection();
    try {
        // Verify token against database
        const [storedToken] = await conn.execute(
            'SELECT * FROM refresh_tokens WHERE token = ? AND expires_at > NOW()', 
            [token]
        );

        if (storedToken.length === 0) {
            return res.status(403).json({ success: false, message: "Invalid or Expired Refresh Token" });
        }

        // Verify JWT integrity
        const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);

        const [user] = await conn.execute('SELECT id, role FROM users WHERE id = ?', [decoded.id]);
        if (user.length === 0) return res.status(404).json({ success: false, message: "User not found" });

        const newAccessToken = generateToken(user[0].id, user[0].role, process.env.JWT_SECRET, '15m');

        res.json({ success: true, data: { accessToken: newAccessToken } });
    } catch (err) {
        return res.status(403).json({ success: false, message: "Token verification failed" });
    } finally {
        conn.release();
    }
});

/**
 * @desc    Logout & Clear Cookie
 * @route   POST /api/auth/logout
 */
export const logout = asyncHandler(async (req, res) => {
    const token = req.cookies.refreshToken;
    const conn = await pool.getConnection();
    try {
        if (token) {
            await conn.execute('DELETE FROM refresh_tokens WHERE token = ?', [token]);
        }
        res.clearCookie('refreshToken');
        res.json({ success: true, message: "በሰላም ወጥተዋል" });
    } finally {
        conn.release();
    }
});

// --- 2. USER PROFILE MANAGEMENT ---

export const getProfile = asyncHandler(async (req, res) => {
    const [user] = await pool.execute('SELECT id, name, email, role, created_at FROM users WHERE id = ?', [req.user.id]);
    res.json({ success: true, data: user[0] });
});

export const updateProfile = asyncHandler(async (req, res) => {
    const { name } = req.body;
    await pool.execute('UPDATE users SET name = ? WHERE id = ?', [name, req.user.id]);
    res.json({ success: true, message: "መረጃዎ ተስተካክሏል" });
});

/**
 * @desc    Get Admin Stats (Real Counts)
 * @route   GET /api/auth/admin/stats
 */
export const getAdminStats = asyncHandler(async (req, res) => {
    const conn = await pool.getConnection();
    try {
        // 1. Total Users
        const [[{ totalUsers }]] = await conn.execute('SELECT COUNT(*) as totalUsers FROM users');
        
        // 2. Total Admins
        const [[{ totalAdmins }]] = await conn.execute('SELECT COUNT(*) as totalAdmins FROM users WHERE role = "admin"');
        
        // 3. New Users This Month (created_at > start of month)
        const [[{ newUsers }]] = await conn.execute(
            'SELECT COUNT(*) as newUsers FROM users WHERE created_at >= DATE_FORMAT(NOW(), "%Y-%m-01")'
        );

        // 4. Active Today (from activity_logs if you have it, otherwise 0)
        // If you don't have activity_logs table yet, just return 0 or remove this query
        let activeToday = 0;
        try {
            const [[{ count }]] = await conn.execute(
                'SELECT COUNT(DISTINCT user_id) as count FROM activity_logs WHERE created_at >= CURDATE()'
            );
            activeToday = count;
        } catch (error) {
            // Ignore if table doesn't exist
        }

        res.json({
            success: true,
            data: {
                totalUsers,
                totalAdmins,
                newUsers,
                activeToday
            }
        });
    } finally {
        conn.release();
    }
});

// --- 3. ADMIN DASHBOARD LOGIC ---

/**
 * @desc    Get all users with Search & Pagination
 * @route   GET /api/auth/admin/users
 */
export const getAllUsers = asyncHandler(async (req, res) => {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const search = req.query.search || '';
    
    const offset = (page - 1) * limit;
    const term = `%${search}%`;

    const [users] = await pool.execute(
        'SELECT id, name, email, role, created_at FROM users WHERE name LIKE ? OR email LIKE ? ORDER BY created_at DESC LIMIT ? OFFSET ?',
        [term, term, limit, offset]
    );

    const [[{ total }]] = await pool.execute(
        'SELECT COUNT(*) as total FROM users WHERE name LIKE ? OR email LIKE ?', 
        [term, term]
    );

    res.json({
        success: true,
        data: {
            users,
            pagination: {
                total,
                pages: Math.ceil(total / limit),
                currentPage: page,
                limit
            }
        }
    });
});

/**
 * @desc    Admin Delete User
 */
export const deleteUser = asyncHandler(async (req, res) => {
    const targetId = Number(req.params.id);
    if (targetId === req.user.id) {
        return res.status(400).json({ success: false, message: "ራስዎን መሰረዝ አይችሉም!" });
    }

    const [result] = await pool.execute('DELETE FROM users WHERE id = ?', [targetId]);
    if (result.affectedRows === 0) return res.status(404).json({ success: false, message: "ተጠቃሚው አልተገኘም" });

    res.json({ success: true, message: "ተጠቃሚው ተሰርዟል" });
});

/**
 * @desc    Admin Update User (Role/Name)
 */
// controllers/authController.js

export const adminUpdateUser = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { name, email, role, password } = req.body; // አሁን email ተጨምሯል

    // መጀመሪያ ስም፣ ኢሜይል እና ሮልን እናዘምናለን
    let query = 'UPDATE users SET name = ?, email = ?, role = ?';
    let params = [name, email, role];

    // ፓስወርድ መቀየር ከፈለገ ብቻ
    if (password && password.trim() !== '') {
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        query += ', password = ?';
        params.push(hashedPassword);
    }

    query += ' WHERE id = ?';
    params.push(id);

    const [result] = await pool.execute(query, params);
    
    if (result.affectedRows === 0) {
        return res.status(404).json({ message: 'ተጠቃሚው አልተገኘም' });
    }

    res.json({ success: true, message: 'ተጠቃሚው በሚገባ ተስተካክሏል' });
});

/**
 * @desc    Admin Create User
 */
export const adminCreateUser = asyncHandler(async (req, res) => {
    const { name, email, password, role } = req.body;
    const [exists] = await pool.execute('SELECT id FROM users WHERE email = ?', [email]);
    if (exists.length > 0) return res.status(409).json({ success: false, message: "ኢሜይሉ ተይዟል" });

    const hashedPassword = await bcrypt.hash(password, 12);
    await pool.execute('INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)', 
        [name, email, hashedPassword, role]);

    res.status(201).json({ success: true, message: "ተጠቃሚው ተፈጥሯል" });
});