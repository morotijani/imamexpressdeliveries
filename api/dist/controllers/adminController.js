"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteContactMessage = exports.markContactMessageRead = exports.getContactMessages = exports.toggleCustomerSuspension = exports.getSystemStatus = exports.getPricing = exports.updatePricing = exports.getCustomers = exports.getRiders = exports.assignRider = exports.getAllOrders = exports.getDashboardMetrics = void 0;
const prisma_1 = __importDefault(require("../prisma"));
const client_1 = require("@prisma/client");
const mailer_1 = require("../utils/mailer");
const axios_1 = __importDefault(require("axios"));
const getDashboardMetrics = async (req, res) => {
    try {
        const totalDeliveries = await prisma_1.default.order.count({ where: { status: 'DELIVERED' } });
        const revenueResult = await prisma_1.default.order.aggregate({
            _sum: { price: true },
            where: { status: 'DELIVERED' }
        });
        const totalRevenue = revenueResult._sum.price || 0;
        const activeRiders = await prisma_1.default.user.count({
            where: { role: 'RIDER' } // We can enhance this later to check if they have active orders
        });
        res.json({ totalDeliveries, totalRevenue, activeRiders });
    }
    catch (error) {
        res.status(500).json({ message: 'Error fetching metrics', error: error.message });
    }
};
exports.getDashboardMetrics = getDashboardMetrics;
const getAllOrders = async (req, res) => {
    try {
        const orders = await prisma_1.default.order.findMany({
            include: {
                customer: { select: { name: true, email: true } },
                rider: { select: { name: true, phone: true } }
            },
            orderBy: { createdAt: 'desc' }
        });
        res.json({ orders });
    }
    catch (error) {
        res.status(500).json({ message: 'Error fetching orders', error: error.message });
    }
};
exports.getAllOrders = getAllOrders;
const assignRider = async (req, res) => {
    try {
        const { orderId, riderId } = req.body;
        const rider = await prisma_1.default.user.findFirst({ where: { id: riderId, role: 'RIDER' } });
        if (!rider)
            return res.status(404).json({ message: 'Rider not found' });
        const order = await prisma_1.default.order.update({
            where: { id: orderId },
            data: { riderId, status: client_1.OrderStatus.ASSIGNED }
        });
        res.json({ message: 'Rider assigned successfully', order });
    }
    catch (error) {
        res.status(500).json({ message: 'Error assigning rider', error: error.message });
    }
};
exports.assignRider = assignRider;
const getRiders = async (req, res) => {
    try {
        const riders = await prisma_1.default.user.findMany({ where: { role: 'RIDER' } });
        res.json({ riders });
    }
    catch (error) {
        res.status(500).json({ message: 'Error fetching riders', error: error.message });
    }
};
exports.getRiders = getRiders;
const getCustomers = async (req, res) => {
    try {
        const customers = await prisma_1.default.user.findMany({ where: { role: 'CUSTOMER' } });
        res.json({ customers });
    }
    catch (error) {
        res.status(500).json({ message: 'Error fetching customers', error: error.message });
    }
};
exports.getCustomers = getCustomers;
const updatePricing = async (req, res) => {
    try {
        const { baseRate, perKmRate, expressMultiplier, documentMultiplier, foodMultiplier, electronicsMultiplier, fragileMultiplier, otherMultiplier } = req.body;
        if (baseRate < 0 || perKmRate < 0 || expressMultiplier < 0) {
            return res.status(400).json({ message: 'Pricing values cannot be negative' });
        }
        let pricing = await prisma_1.default.pricingConfig.findFirst();
        if (pricing) {
            pricing = await prisma_1.default.pricingConfig.update({
                where: { id: pricing.id },
                data: { baseRate, perKmRate, expressMultiplier, documentMultiplier, foodMultiplier, electronicsMultiplier, fragileMultiplier, otherMultiplier }
            });
        }
        else {
            pricing = await prisma_1.default.pricingConfig.create({
                data: { baseRate, perKmRate, expressMultiplier, documentMultiplier, foodMultiplier, electronicsMultiplier, fragileMultiplier, otherMultiplier }
            });
        }
        res.json({ message: 'Pricing updated successfully', pricing });
    }
    catch (error) {
        res.status(500).json({ message: 'Error updating pricing', error: error.message });
    }
};
exports.updatePricing = updatePricing;
const getPricing = async (req, res) => {
    try {
        const pricing = await prisma_1.default.pricingConfig.findFirst();
        if (!pricing) {
            // Return defaults if not found
            return res.json({ pricing: { baseRate: 5.0, perKmRate: 1.5, expressMultiplier: 1.5, documentMultiplier: 1.0, foodMultiplier: 1.2, electronicsMultiplier: 1.5, fragileMultiplier: 1.8, otherMultiplier: 1.0 } });
        }
        res.json({ pricing });
    }
    catch (error) {
        res.status(500).json({ message: 'Error fetching pricing', error: error.message });
    }
};
exports.getPricing = getPricing;
const getSystemStatus = async (req, res) => {
    try {
        // 1. Database Status
        const dbStatus = await prisma_1.default.$queryRaw `SELECT 1`.then(() => 'online').catch(() => 'offline');
        // 2. Email Status
        let emailStatus = 'offline';
        try {
            await mailer_1.transporter.verify();
            emailStatus = 'online';
        }
        catch (err) {
            emailStatus = 'offline';
        }
        // 3. Internet Status (pinging google)
        let internetStatus = 'offline';
        try {
            await axios_1.default.get('https://www.google.com', { timeout: 3000 });
            internetStatus = 'online';
        }
        catch (err) {
            internetStatus = 'offline';
        }
        res.json({ dbStatus, emailStatus, internetStatus });
    }
    catch (error) {
        res.status(500).json({ message: 'Error fetching system status', error: error.message });
    }
};
exports.getSystemStatus = getSystemStatus;
const toggleCustomerSuspension = async (req, res) => {
    try {
        const id = req.params.id;
        const customer = await prisma_1.default.user.findFirst({ where: { id, role: 'CUSTOMER' } });
        if (!customer)
            return res.status(404).json({ message: 'Customer not found' });
        const updatedCustomer = await prisma_1.default.user.update({
            where: { id },
            data: { isSuspended: !customer.isSuspended }
        });
        res.json({ message: `Customer ${updatedCustomer.isSuspended ? 'suspended' : 'unsuspended'} successfully`, customer: updatedCustomer });
    }
    catch (error) {
        res.status(500).json({ message: 'Error toggling customer suspension', error: error.message });
    }
};
exports.toggleCustomerSuspension = toggleCustomerSuspension;
const getContactMessages = async (req, res) => {
    try {
        const messages = await prisma_1.default.contactMessage.findMany({ orderBy: { createdAt: 'desc' } });
        res.json({ messages });
    }
    catch (error) {
        res.status(500).json({ message: 'Error fetching contact messages', error: error.message });
    }
};
exports.getContactMessages = getContactMessages;
const markContactMessageRead = async (req, res) => {
    try {
        const id = req.params.id;
        const message = await prisma_1.default.contactMessage.update({
            where: { id },
            data: { isRead: true }
        });
        res.json({ message: 'Message marked as read', contactMessage: message });
    }
    catch (error) {
        res.status(500).json({ message: 'Error updating contact message', error: error.message });
    }
};
exports.markContactMessageRead = markContactMessageRead;
const deleteContactMessage = async (req, res) => {
    try {
        const id = req.params.id;
        await prisma_1.default.contactMessage.delete({ where: { id } });
        res.json({ message: 'Message deleted successfully' });
    }
    catch (error) {
        res.status(500).json({ message: 'Error deleting contact message', error: error.message });
    }
};
exports.deleteContactMessage = deleteContactMessage;
