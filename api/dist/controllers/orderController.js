"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.estimatePrice = exports.getOrderById = exports.getCustomerOrders = exports.createOrder = void 0;
const prisma_1 = __importDefault(require("../prisma"));
const google_maps_services_js_1 = require("@googlemaps/google-maps-services-js");
const googleMapsClient = new google_maps_services_js_1.Client({});
// Utility to calculate distance and price
const calculatePrice = (distance, baseRate, perKmRate, multiplier = 1.0) => {
    return (baseRate + (distance * perKmRate)) * multiplier;
};
const getMultiplier = (packageType, pricing) => {
    switch (packageType) {
        case 'documents': return pricing.documentMultiplier;
        case 'food': return pricing.foodMultiplier;
        case 'electronics': return pricing.electronicsMultiplier;
        case 'fragile': return pricing.fragileMultiplier;
        case 'clothing': return pricing.otherMultiplier;
        case 'other': return pricing.otherMultiplier;
        default: return 1.0;
    }
};
async function getDistance(origin, destination) {
    if (!process.env.GOOGLE_MAPS_API_KEY) {
        throw new Error('Google Maps API key is missing in backend .env');
    }
    try {
        const response = await googleMapsClient.distancematrix({
            params: {
                origins: [origin],
                destinations: [destination],
                key: process.env.GOOGLE_MAPS_API_KEY,
            },
        });
        const element = response.data.rows[0]?.elements[0];
        if (element?.status === 'OK') {
            // distance.value is in meters, convert to km
            return element.distance.value / 1000;
        }
        else if (element?.status === 'ZERO_RESULTS') {
            throw new Error('No valid driving route found between these locations.');
        }
        else {
            console.error('Google Maps Distance Matrix element error:', element);
            throw new Error(`Google Maps API error: ${element?.status}`);
        }
    }
    catch (error) {
        if (error.message.includes('driving route')) {
            throw error; // Re-throw our custom error
        }
        console.error('Google Maps API call failed:', error.response?.data || error.message);
        throw new Error(error.message || 'Could not calculate distance between the provided locations');
    }
}
const createOrder = async (req, res) => {
    try {
        const { pickupLocation, dropoffLocation, receiverName, receiverContact, packageDescription, packageType } = req.body;
        const customerId = req.user.userId;
        // Fetch pricing config (use first one or defaults)
        let pricing = await prisma_1.default.pricingConfig.findFirst();
        if (!pricing) {
            pricing = await prisma_1.default.pricingConfig.create({ data: {} }); // Creates with default values
        }
        const multiplier = getMultiplier(packageType, pricing);
        // Real distance calculation
        const distance = await getDistance(pickupLocation, dropoffLocation);
        const price = calculatePrice(distance, pricing.baseRate, pricing.perKmRate, multiplier);
        // Generate random 4-digit PIN
        const deliveryPin = Math.floor(1000 + Math.random() * 9000).toString();
        const order = await prisma_1.default.order.create({
            data: {
                pickupLocation,
                dropoffLocation,
                receiverName,
                receiverContact,
                packageDescription,
                packageType,
                price,
                distance,
                customerId,
                deliveryPin
            }
        });
        res.status(201).json({ message: 'Order created successfully', order });
    }
    catch (error) {
        res.status(500).json({ message: 'Error creating order', error: error.message });
    }
};
exports.createOrder = createOrder;
const getCustomerOrders = async (req, res) => {
    try {
        const customerId = req.user.userId;
        const orders = await prisma_1.default.order.findMany({
            where: { customerId },
            include: {
                rider: {
                    select: { name: true, phone: true }
                }
            },
            orderBy: { createdAt: 'desc' }
        });
        res.json({ orders });
    }
    catch (error) {
        res.status(500).json({ message: 'Error fetching orders', error: error.message });
    }
};
exports.getCustomerOrders = getCustomerOrders;
const getOrderById = async (req, res) => {
    try {
        const id = req.params.id;
        const order = await prisma_1.default.order.findUnique({
            where: { id },
            include: {
                rider: { select: { name: true, phone: true } }
            }
        });
        if (!order)
            return res.status(404).json({ message: 'Order not found' });
        res.json({ order });
    }
    catch (error) {
        res.status(500).json({ message: 'Error fetching order', error: error.message });
    }
};
exports.getOrderById = getOrderById;
const estimatePrice = async (req, res) => {
    try {
        const { pickupLocation, dropoffLocation, packageType } = req.body;
        let pricing = await prisma_1.default.pricingConfig.findFirst();
        if (!pricing) {
            pricing = await prisma_1.default.pricingConfig.create({ data: {} });
        }
        const multiplier = getMultiplier(packageType, pricing);
        const distance = await getDistance(pickupLocation, dropoffLocation);
        const price = calculatePrice(distance, pricing.baseRate, pricing.perKmRate, multiplier);
        res.json({ estimate: price, distance, multiplier });
    }
    catch (error) {
        res.status(500).json({ message: 'Error calculating estimate', error: error.message });
    }
};
exports.estimatePrice = estimatePrice;
