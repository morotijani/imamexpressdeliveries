import { Request, Response } from 'express';
import prisma from '../prisma';
import { AuthRequest } from '../middlewares/auth';
import { Client } from '@googlemaps/google-maps-services-js';

const googleMapsClient = new Client({});

// Utility to calculate distance and price
const calculatePrice = (distance: number, baseRate: number, perKmRate: number, multiplier: number = 1.0) => {
  return (baseRate + (distance * perKmRate)) * multiplier;
};

const getMultiplier = (packageType: string, pricing: any) => {
  switch (packageType) {
    case 'documents': return pricing.documentMultiplier;
    case 'food': return pricing.foodMultiplier;
    case 'electronics': return pricing.electronicsMultiplier;
    case 'clothing': return pricing.otherMultiplier;
    case 'other': return pricing.otherMultiplier;
    default: return 1.0;
  }
};

async function getDistance(origin: string, destination: string): Promise<number> {
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
    } else if (element?.status === 'ZERO_RESULTS') {
      throw new Error('No valid driving route found between these locations.');
    } else {
      console.error('Google Maps Distance Matrix element error:', element);
      throw new Error(`Google Maps API error: ${element?.status}`);
    }
  } catch (error: any) {
    if (error.message.includes('driving route')) {
      throw error; // Re-throw our custom error
    }
    console.error('Google Maps API call failed:', error.response?.data || error.message);
    throw new Error(error.message || 'Could not calculate distance between the provided locations');
  }
}

export const createOrder = async (req: AuthRequest, res: Response): Promise<any> => {
  try {
    const { pickupLocation, dropoffLocation, receiverName, receiverContact, packageDescription, packageType } = req.body;
    const customerId = req.user.userId;

    // Fetch pricing config (use first one or defaults)
    let pricing = await prisma.pricingConfig.findFirst();
    if (!pricing) {
      pricing = await prisma.pricingConfig.create({ data: {} }); // Creates with default values
    }

    const multiplier = getMultiplier(packageType, pricing);

    // Real distance calculation
    const distance = await getDistance(pickupLocation, dropoffLocation);
    const price = calculatePrice(distance, pricing.baseRate, pricing.perKmRate, multiplier);

    const order = await prisma.order.create({
      data: {
        pickupLocation,
        dropoffLocation,
        receiverName,
        receiverContact,
        packageDescription,
        packageType,
        price,
        distance,
        customerId
      }
    });

    res.status(201).json({ message: 'Order created successfully', order });
  } catch (error: any) {
    res.status(500).json({ message: 'Error creating order', error: error.message });
  }
};

export const getCustomerOrders = async (req: AuthRequest, res: Response): Promise<any> => {
  try {
    const customerId = req.user.userId;
    const orders = await prisma.order.findMany({
      where: { customerId },
      include: {
        rider: {
          select: { name: true, phone: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json({ orders });
  } catch (error: any) {
    res.status(500).json({ message: 'Error fetching orders', error: error.message });
  }
};

export const getOrderById = async (req: AuthRequest, res: Response): Promise<any> => {
  try {
    const id = req.params.id as string;
    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        rider: { select: { name: true, phone: true } }
      }
    });

    if (!order) return res.status(404).json({ message: 'Order not found' });

    res.json({ order });
  } catch (error: any) {
    res.status(500).json({ message: 'Error fetching order', error: error.message });
  }
};

export const estimatePrice = async (req: AuthRequest, res: Response): Promise<any> => {
  try {
    const { pickupLocation, dropoffLocation, packageType } = req.body;
    
    let pricing = await prisma.pricingConfig.findFirst();
    if (!pricing) {
      pricing = await prisma.pricingConfig.create({ data: {} });
    }

    const multiplier = getMultiplier(packageType, pricing);
    const distance = await getDistance(pickupLocation, dropoffLocation);
    const price = calculatePrice(distance, pricing.baseRate, pricing.perKmRate, multiplier);

    res.json({ estimate: price, distance, multiplier });
  } catch (error: any) {
    res.status(500).json({ message: 'Error calculating estimate', error: error.message });
  }
};
