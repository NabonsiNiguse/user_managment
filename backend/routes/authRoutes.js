import express from 'express';
import {
    register,
    login,
    getProfile,
    updateProfile,
    getAllUsers,
    adminCreateUser,
    adminUpdateUser,
    deleteUser,
    refreshToken,
    logout,
    getAdminStats // <--- Add this import
} from '../controllers/authController.js';
import { verifyToken, authorizeRoles } from '../middleware/auth.js';

const router = express.Router();

// --- 🔓 PUBLIC ROUTES ---
router.post('/register', register);
router.post('/login', login);
router.post('/refresh-token', refreshToken);
router.post('/logout', logout);

// --- 🔒 PROTECTED ROUTES (User & Admin) ---
router.get('/profile', verifyToken, getProfile);
router.put('/profile', verifyToken, updateProfile);

// --- 🛡️ ADMIN ONLY ROUTES ---

// 1. Get Real Stats (Total Users, Admins, etc.)
router.get('/admin/stats', verifyToken, authorizeRoles('admin'), getAdminStats);

// 2. User Management
router.get('/admin/users', verifyToken, authorizeRoles('admin'), getAllUsers);
router.post('/admin/create-user', verifyToken, authorizeRoles('admin'), adminCreateUser);
router.put('/admin/update-user/:id', verifyToken, authorizeRoles('admin'), adminUpdateUser);
router.delete('/admin/users/:id', verifyToken, authorizeRoles('admin'), deleteUser);

export default router;