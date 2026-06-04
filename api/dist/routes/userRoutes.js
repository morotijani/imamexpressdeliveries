"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const userController_1 = require("../controllers/userController");
const auth_1 = require("../middlewares/auth");
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const storage = multer_1.default.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path_1.default.join(__dirname, '../../uploads/profiles/'));
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path_1.default.extname(file.originalname));
    }
});
const upload = (0, multer_1.default)({ storage });
const router = (0, express_1.Router)();
router.get('/profile', auth_1.authenticateJWT, userController_1.getProfile);
router.put('/profile', auth_1.authenticateJWT, userController_1.updateProfile);
router.put('/change-password', auth_1.authenticateJWT, userController_1.changePassword);
router.post('/upload-profile-image', auth_1.authenticateJWT, upload.single('profileImage'), userController_1.uploadProfileImage);
exports.default = router;
