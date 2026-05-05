import { Router } from 'express';
import { getProfile, updateProfile, changePassword } from '../controllers/userController';
import { authenticateJWT } from '../middlewares/auth';

const router = Router();

router.get('/profile', authenticateJWT, getProfile);
router.put('/profile', authenticateJWT, updateProfile);
router.put('/change-password', authenticateJWT, changePassword);

export default router;
