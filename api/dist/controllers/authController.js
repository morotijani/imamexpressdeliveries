"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.resetPassword = exports.forgotPassword = exports.resendVerification = exports.verifyEmail = exports.login = exports.register = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const crypto_1 = __importDefault(require("crypto"));
const prisma_1 = __importDefault(require("../prisma"));
const mailer_1 = require("../utils/mailer");
const register = async (req, res) => {
    try {
        const { email, password, name, phone, role, homeAddress, workAddress } = req.body;
        // Validate required fields
        if (!name || !email || !phone || !password) {
            return res.status(400).json({ message: 'Please provide all required fields' });
        }
        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({ message: 'Please enter a valid email address' });
        }
        // Validate Ghana phone number
        const ghanaPhoneRegex = /^(?:\+233|0)[235][0-9]{8}$/;
        if (!ghanaPhoneRegex.test(phone.replace(/\s+/g, ''))) {
            return res.status(400).json({ message: 'Phone number must be a valid Ghana number' });
        }
        // Validate password
        if (password.length < 6) {
            return res.status(400).json({ message: 'Password must be at least 6 characters long' });
        }
        const passwordSpecialRegex = /[!@#$%^&*(),.?":{}|<>]/;
        if (!passwordSpecialRegex.test(password)) {
            return res.status(400).json({ message: 'Password must contain at least one special character' });
        }
        const existingUser = await prisma_1.default.user.findUnique({ where: { email } });
        if (existingUser) {
            return res.status(400).json({ message: 'User already exists' });
        }
        const hashedPassword = await bcrypt_1.default.hash(password, 10);
        const verificationToken = crypto_1.default.randomBytes(32).toString('hex');
        const verificationTokenExpiresAt = new Date(Date.now() + 15 * 60 * 1000);
        const user = await prisma_1.default.user.create({
            data: {
                email,
                password: hashedPassword,
                name,
                phone,
                homeAddress,
                workAddress,
                role: role || 'CUSTOMER',
                verificationToken,
                verificationTokenExpiresAt,
            },
        });
        await (0, mailer_1.sendVerificationEmail)(email, verificationToken);
        res.status(201).json({ message: 'User registered successfully. Please check your email to verify your account.', userId: user.id });
    }
    catch (error) {
        res.status(500).json({ message: 'Error registering user', error: error.message });
    }
};
exports.register = register;
const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await prisma_1.default.user.findUnique({ where: { email } });
        if (!user) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }
        const isMatch = await bcrypt_1.default.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }
        if (!user.emailVerified) {
            return res.status(403).json({ message: 'Please verify your email address before logging in.' });
        }
        const token = jsonwebtoken_1.default.sign({ userId: user.id, role: user.role, email: user.email }, process.env.JWT_SECRET, { expiresIn: '24h' });
        res.json({ token, user: { id: user.id, name: user.name, role: user.role, email: user.email, profileImage: user.profileImage } });
    }
    catch (error) {
        res.status(500).json({ message: 'Error logging in', error: error.message });
    }
};
exports.login = login;
const verifyEmail = async (req, res) => {
    try {
        const { token } = req.query;
        if (!token) {
            return res.status(400).json({ message: 'Verification token is required' });
        }
        const user = await prisma_1.default.user.findFirst({
            where: { verificationToken: token },
        });
        if (!user) {
            return res.status(404).json({ message: 'Invalid verification token' });
        }
        if (user.verificationTokenExpiresAt && user.verificationTokenExpiresAt < new Date()) {
            return res.status(400).json({ message: 'Verification token has expired' });
        }
        await prisma_1.default.user.update({
            where: { id: user.id },
            data: {
                emailVerified: true,
                verificationToken: null,
                verificationTokenExpiresAt: null,
            },
        });
        res.json({ message: 'Email verified successfully. You can now log in.' });
    }
    catch (error) {
        res.status(500).json({ message: 'Error verifying email', error: error.message });
    }
};
exports.verifyEmail = verifyEmail;
const resendVerification = async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) {
            return res.status(400).json({ message: 'Email is required' });
        }
        const user = await prisma_1.default.user.findUnique({ where: { email } });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        if (user.emailVerified) {
            return res.status(400).json({ message: 'Email is already verified' });
        }
        const verificationToken = crypto_1.default.randomBytes(32).toString('hex');
        const verificationTokenExpiresAt = new Date(Date.now() + 15 * 60 * 1000);
        await prisma_1.default.user.update({
            where: { id: user.id },
            data: { verificationToken, verificationTokenExpiresAt },
        });
        await (0, mailer_1.sendVerificationEmail)(email, verificationToken);
        res.json({ message: 'Verification email resent successfully' });
    }
    catch (error) {
        res.status(500).json({ message: 'Error resending verification email', error: error.message });
    }
};
exports.resendVerification = resendVerification;
const forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) {
            return res.status(400).json({ message: 'Email is required' });
        }
        const user = await prisma_1.default.user.findUnique({ where: { email } });
        if (!user) {
            return res.status(404).json({ message: 'No account found with that email address.' });
        }
        const resetToken = crypto_1.default.randomBytes(32).toString('hex');
        const resetExpires = new Date(Date.now() + 15 * 60 * 1000); // 15 mins
        await prisma_1.default.user.update({
            where: { id: user.id },
            data: {
                resetPasswordToken: resetToken,
                resetPasswordExpiresAt: resetExpires
            }
        });
        await (0, mailer_1.sendPasswordResetEmail)(email, resetToken);
        res.status(200).json({ message: 'Reset link sent to your email.' });
    }
    catch (error) {
        res.status(500).json({ message: 'Error in forgot password', error: error.message });
    }
};
exports.forgotPassword = forgotPassword;
const resetPassword = async (req, res) => {
    try {
        const { token, newPassword } = req.body;
        if (!token || !newPassword) {
            return res.status(400).json({ message: 'Token and new password are required' });
        }
        if (newPassword.length < 6) {
            return res.status(400).json({ message: 'Password must be at least 6 characters long' });
        }
        const user = await prisma_1.default.user.findFirst({
            where: { resetPasswordToken: token }
        });
        if (!user) {
            return res.status(400).json({ message: 'This password reset link is invalid or has already been used.' });
        }
        if (user.resetPasswordExpiresAt && user.resetPasswordExpiresAt < new Date()) {
            return res.status(400).json({ message: 'This password reset link has expired.' });
        }
        const hashedPassword = await bcrypt_1.default.hash(newPassword, 10);
        await prisma_1.default.user.update({
            where: { id: user.id },
            data: {
                password: hashedPassword,
                resetPasswordToken: null,
                resetPasswordExpiresAt: null
            }
        });
        await (0, mailer_1.sendPasswordChangedEmail)(user.email);
        res.status(200).json({ message: 'Password has been successfully reset. You can now login.' });
    }
    catch (error) {
        res.status(500).json({ message: 'Error resetting password', error: error.message });
    }
};
exports.resetPassword = resetPassword;
