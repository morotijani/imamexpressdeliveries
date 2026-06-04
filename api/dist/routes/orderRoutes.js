"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const orderController_1 = require("../controllers/orderController");
const auth_1 = require("../middlewares/auth");
const router = (0, express_1.Router)();
// Protect all order routes
router.use(auth_1.authenticateJWT);
// Customer routes
router.post('/estimate', (0, auth_1.requireRole)(['CUSTOMER']), orderController_1.estimatePrice);
router.post('/', (0, auth_1.requireRole)(['CUSTOMER']), orderController_1.createOrder);
router.get('/my-orders', (0, auth_1.requireRole)(['CUSTOMER']), orderController_1.getCustomerOrders);
// General (Customer, Admin, Rider) route for viewing details
router.get('/:id', orderController_1.getOrderById);
exports.default = router;
