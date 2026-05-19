import { Router } from 'express';
import { subscribeNewsletter } from '../controllers/publicController';

const router = Router();

router.post('/newsletter', subscribeNewsletter);

export default router;
