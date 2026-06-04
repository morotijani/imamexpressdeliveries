"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.changePassword = exports.uploadProfileImage = exports.updateProfile = exports.getProfile = void 0;
const prisma_1 = __importDefault(require("../prisma"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const getProfile = async (req, res) => {
    try {
        const userId = req.user.userId;
        const user = await prisma_1.default.user.findUnique({
            where: { id: userId },
            select: {
                id: true,
                email: true,
                name: true,
                phone: true,
                profileImage: true,
                homeAddress: true,
                workAddress: true,
                role: true,
                createdAt: true
            }
        });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.json({ user });
    }
    catch (error) {
        res.status(500).json({ message: 'Error fetching profile', error });
    }
};
exports.getProfile = getProfile;
const updateProfile = async (req, res) => {
    try {
        const userId = req.user.userId;
        const { name, phone, email, profileImage, homeAddress, workAddress } = req.body;
        const updatedUser = await prisma_1.default.user.update({
            where: { id: userId },
            data: {
                name,
                phone,
                email,
                profileImage,
                homeAddress,
                workAddress
            },
            select: {
                id: true,
                email: true,
                name: true,
                phone: true,
                profileImage: true,
                homeAddress: true,
                workAddress: true,
                role: true
            }
        });
        res.json({ message: 'Profile updated successfully', user: updatedUser });
    }
    catch (error) {
        if (error.code === 'P2002') {
            return res.status(400).json({ message: 'Email already in use' });
        }
        res.status(500).json({ message: 'Error updating profile', error });
    }
};
exports.updateProfile = updateProfile;
const uploadProfileImage = async (req, res) => {
    try {
        const userId = req.user.userId;
        if (!req.file) {
            return res.status(400).json({ message: 'No image file uploaded' });
        }
        const user = await prisma_1.default.user.findUnique({ where: { id: userId } });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        // Delete old profile image if it exists and is a local file
        if (user.profileImage && user.profileImage.startsWith('/uploads/')) {
            const oldImagePath = path_1.default.join(__dirname, '../../', user.profileImage);
            if (fs_1.default.existsSync(oldImagePath)) {
                fs_1.default.unlinkSync(oldImagePath);
            }
        }
        const newImagePath = `/uploads/profiles/${req.file.filename}`;
        const updatedUser = await prisma_1.default.user.update({
            where: { id: userId },
            data: { profileImage: newImagePath },
            select: {
                id: true,
                email: true,
                name: true,
                phone: true,
                profileImage: true,
                homeAddress: true,
                workAddress: true,
                role: true
            }
        });
        res.json({ message: 'Profile image updated successfully', user: updatedUser });
    }
    catch (error) {
        res.status(500).json({ message: 'Error uploading profile image', error });
    }
};
exports.uploadProfileImage = uploadProfileImage;
const changePassword = async (req, res) => {
    try {
        const userId = req.user.userId;
        const { currentPassword, newPassword } = req.body;
        const user = await prisma_1.default.user.findUnique({ where: { id: userId } });
        if (!user)
            return res.status(404).json({ message: 'User not found' });
        const isMatch = await bcrypt_1.default.compare(currentPassword, user.password);
        if (!isMatch)
            return res.status(400).json({ message: 'Incorrect current password' });
        const hashedPassword = await bcrypt_1.default.hash(newPassword, 10);
        await prisma_1.default.user.update({
            where: { id: userId },
            data: { password: hashedPassword }
        });
        res.json({ message: 'Password updated successfully' });
    }
    catch (error) {
        res.status(500).json({ message: 'Error updating password', error: error.message });
    }
};
exports.changePassword = changePassword;
