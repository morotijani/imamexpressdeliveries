"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDashboardStats = exports.updateOrderStatus = exports.getAssignedOrders = void 0;
const prisma_1 = __importDefault(require("../prisma"));
const client_1 = require("@prisma/client");
const getAssignedOrders = async (req, res) => {
    try {
        const riderId = req.user.userId;
        const orders = await prisma_1.default.order.findMany({
            where: { riderId },
            include: {
                customer: {
                    select: { name: true, email: true, phone: true }
                }
            },
            orderBy: { updatedAt: 'desc' }
        });
        res.json({ orders });
    }
    catch (error) {
        res.status(500).json({ message: 'Error fetching assigned orders', error: error.message });
    }
};
exports.getAssignedOrders = getAssignedOrders;
const updateOrderStatus = async (req, res) => {
    try {
        const id = req.params.id;
        const { status, pin } = req.body;
        const riderId = req.user.userId;
        if (!Object.values(client_1.OrderStatus).includes(status)) {
            return res.status(400).json({ message: 'Invalid status' });
        }
        const order = await prisma_1.default.order.findUnique({ where: { id } });
        if (!order)
            return res.status(404).json({ message: 'Order not found' });
        if (order.riderId !== riderId && req.user.role !== 'ADMIN') {
            return res.status(403).json({ message: 'Forbidden: You are not assigned to this order' });
        }
        // Security Feature: Require PIN if marking as DELIVERED
        if (status === 'DELIVERED') {
            if (!pin) {
                return res.status(400).json({ message: 'A 4-digit PIN is required to complete this delivery.' });
            }
            if (order.deliveryPin && pin !== order.deliveryPin) {
                return res.status(400).json({ message: 'Invalid PIN. Please ask the receiver for the correct 4-digit PIN.' });
            }
        }
        const updatedOrder = await prisma_1.default.order.update({
            where: { id },
            data: { status }
        });
        res.json({ message: 'Order status updated', order: updatedOrder });
    }
    catch (error) {
        res.status(500).json({ message: 'Error updating order status', error: error.message });
    }
};
exports.updateOrderStatus = updateOrderStatus;
const getDashboardStats = async (req, res) => {
    try {
        const riderId = req.user.userId;
        // Get all completed orders for this rider
        const completedOrders = await prisma_1.default.order.findMany({
            where: { riderId, status: 'DELIVERED' },
            orderBy: { updatedAt: 'desc' }
        });
        // Calculate total earnings
        const totalEarnings = completedOrders.reduce((sum, order) => sum + order.price, 0);
        // Get today's stats
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const todaysOrders = completedOrders.filter(o => o.updatedAt >= today);
        const todaysEarnings = todaysOrders.reduce((sum, order) => sum + order.price, 0);
        // Get the active delivery (if any)
        const activeDelivery = await prisma_1.default.order.findFirst({
            where: {
                riderId,
                status: { in: ['ASSIGNED', 'PICKED_UP'] }
            },
            orderBy: { updatedAt: 'desc' }
        });
        res.json({
            totalEarnings,
            totalCompleted: completedOrders.length,
            todaysEarnings,
            todaysCompleted: todaysOrders.length,
            activeDelivery,
            recentCompleted: completedOrders.slice(0, 5) // Last 5 completed
        });
    }
    catch (error) {
        res.status(500).json({ message: 'Error fetching dashboard stats', error: error.message });
    }
};
exports.getDashboardStats = getDashboardStats;
