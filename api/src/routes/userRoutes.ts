import { Router } from 'express';
import { getProfile, updateProfile } from '../controllers/userController';
import { authenticateJWT } from '../middlewares/auth';

const router = Router();

router.get('/profile', authenticateJWT, getProfile);
router.put('/profile', authenticateJWT, updateProfile);

export default router;
