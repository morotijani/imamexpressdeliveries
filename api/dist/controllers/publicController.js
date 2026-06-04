"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.submitContactForm = exports.subscribeNewsletter = void 0;
const prisma_1 = __importDefault(require("../prisma"));
const subscribeNewsletter = async (req, res) => {
    try {
        const { email } = req.body;
        if (!email || !email.includes('@')) {
            res.status(400).json({ success: false, message: 'Valid email address is required' });
            return;
        }
        // Check if already subscribed
        const existingSubscriber = await prisma_1.default.newsletterSubscriber.findUnique({
            where: { email },
        });
        if (existingSubscriber) {
            res.status(400).json({ success: false, message: 'Email is already subscribed to the newsletter' });
            return;
        }
        // Subscribe
        await prisma_1.default.newsletterSubscriber.create({
            data: { email },
        });
        res.status(201).json({ success: true, message: 'Successfully subscribed to the newsletter' });
    }
    catch (error) {
        console.error('Error subscribing to newsletter:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
};
exports.subscribeNewsletter = subscribeNewsletter;
const submitContactForm = async (req, res) => {
    try {
        const { name, email, message } = req.body;
        if (!name || !email || !message) {
            res.status(400).json({ success: false, message: 'Name, email, and message are required' });
            return;
        }
        await prisma_1.default.contactMessage.create({
            data: { name, email, message },
        });
        res.status(201).json({ success: true, message: 'Message sent successfully' });
    }
    catch (error) {
        console.error('Error submitting contact form:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
};
exports.submitContactForm = submitContactForm;
