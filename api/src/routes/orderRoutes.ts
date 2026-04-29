import { Router } from 'express';
import { createOrder, getCustomerOrders, getOrderById, estimatePrice } from '../controllers/orderController';
import { authenticateJWT, requireRole } from '../middlewares/auth';

const router = Router();

// Protect all order routes
router.use(authenticateJWT);

// Customer routes
router.post('/estimate', requireRole(['CUSTOMER']), estimatePrice);
router.post('/', requireRole(['CUSTOMER']), createOrder);
router.get('/my-orders', requireRole(['CUSTOMER']), getCustomerOrders);

// General (Customer, Admin, Rider) route for viewing details
router.get('/:id', getOrderById);

export default router;
