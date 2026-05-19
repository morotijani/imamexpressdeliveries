import { Response } from 'express';
import prisma from '../prisma';
import { AuthRequest } from '../middlewares/auth';
import { OrderStatus } from '@prisma/client';
import { transporter } from '../utils/mailer';
import axios from 'axios';

export const getDashboardMetrics = async (req: AuthRequest, res: Response): Promise<any> => {
  try {
    const totalDeliveries = await prisma.order.count({ where: { status: 'DELIVERED' } });
    
    const revenueResult = await prisma.order.aggregate({
      _sum: { price: true },
      where: { status: 'DELIVERED' }
    });
    const totalRevenue = revenueResult._sum.price || 0;

    const activeRiders = await prisma.user.count({
      where: { role: 'RIDER' } // We can enhance this later to check if they have active orders
    });

    res.json({ totalDeliveries, totalRevenue, activeRiders });
  } catch (error: any) {
    res.status(500).json({ message: 'Error fetching metrics', error: error.message });
  }
};

export const getAllOrders = async (req: AuthRequest, res: Response): Promise<any> => {
  try {
    const orders = await prisma.order.findMany({
      include: {
        customer: { select: { name: true, email: true } },
        rider: { select: { name: true, phone: true } }
      },
      orderBy: { createdAt: 'desc' }
    });
    res.json({ orders });
  } catch (error: any) {
    res.status(500).json({ message: 'Error fetching orders', error: error.message });
  }
};

export const assignRider = async (req: AuthRequest, res: Response): Promise<any> => {
  try {
    const { orderId, riderId } = req.body;
    
    const rider = await prisma.user.findFirst({ where: { id: riderId, role: 'RIDER' } });
    if (!rider) return res.status(404).json({ message: 'Rider not found' });

    const order = await prisma.order.update({
      where: { id: orderId },
      data: { riderId, status: OrderStatus.ASSIGNED }
    });

    res.json({ message: 'Rider assigned successfully', order });
  } catch (error: any) {
    res.status(500).json({ message: 'Error assigning rider', error: error.message });
  }
};

export const getRiders = async (req: AuthRequest, res: Response): Promise<any> => {
  try {
    const riders = await prisma.user.findMany({ where: { role: 'RIDER' } });
    res.json({ riders });
  } catch (error: any) {
    res.status(500).json({ message: 'Error fetching riders', error: error.message });
  }
};

export const getCustomers = async (req: AuthRequest, res: Response): Promise<any> => {
  try {
    const customers = await prisma.user.findMany({ where: { role: 'CUSTOMER' } });
    res.json({ customers });
  } catch (error: any) {
    res.status(500).json({ message: 'Error fetching customers', error: error.message });
  }
};

export const updatePricing = async (req: AuthRequest, res: Response): Promise<any> => {
  try {
    const { baseRate, perKmRate, expressMultiplier, documentMultiplier, foodMultiplier, electronicsMultiplier, fragileMultiplier, otherMultiplier } = req.body;

    if (baseRate < 0 || perKmRate < 0 || expressMultiplier < 0) {
      return res.status(400).json({ message: 'Pricing values cannot be negative' });
    }

    let pricing = await prisma.pricingConfig.findFirst();
    
    if (pricing) {
      pricing = await prisma.pricingConfig.update({
        where: { id: pricing.id },
        data: { baseRate, perKmRate, expressMultiplier, documentMultiplier, foodMultiplier, electronicsMultiplier, fragileMultiplier, otherMultiplier }
      });
    } else {
      pricing = await prisma.pricingConfig.create({
        data: { baseRate, perKmRate, expressMultiplier, documentMultiplier, foodMultiplier, electronicsMultiplier, fragileMultiplier, otherMultiplier }
      });
    }

    res.json({ message: 'Pricing updated successfully', pricing });
  } catch (error: any) {
    res.status(500).json({ message: 'Error updating pricing', error: error.message });
  }
};
export const getPricing = async (req: AuthRequest, res: Response): Promise<any> => {
  try {
    const pricing = await prisma.pricingConfig.findFirst();
    if (!pricing) {
      // Return defaults if not found
      return res.json({ pricing: { baseRate: 5.0, perKmRate: 1.5, expressMultiplier: 1.5, documentMultiplier: 1.0, foodMultiplier: 1.2, electronicsMultiplier: 1.5, fragileMultiplier: 1.8, otherMultiplier: 1.0 } });
    }
    res.json({ pricing });
  } catch (error: any) {
    res.status(500).json({ message: 'Error fetching pricing', error: error.message });
  }
};

export const getSystemStatus = async (req: AuthRequest, res: Response): Promise<any> => {
  try {
    // 1. Database Status
    const dbStatus = await prisma.$queryRaw`SELECT 1`.then(() => 'online').catch(() => 'offline');

    // 2. Email Status
    let emailStatus = 'offline';
    try {
      await transporter.verify();
      emailStatus = 'online';
    } catch (err) {
      emailStatus = 'offline';
    }

    // 3. Internet Status (pinging google)
    let internetStatus = 'offline';
    try {
      await axios.get('https://www.google.com', { timeout: 3000 });
      internetStatus = 'online';
    } catch (err) {
      internetStatus = 'offline';
    }

    res.json({ dbStatus, emailStatus, internetStatus });
  } catch (error: any) {
    res.status(500).json({ message: 'Error fetching system status', error: error.message });
  }
};

export const toggleCustomerSuspension = async (req: AuthRequest, res: Response): Promise<any> => {
  try {
    const id = req.params.id as string;
    
    const customer = await prisma.user.findFirst({ where: { id, role: 'CUSTOMER' } });
    if (!customer) return res.status(404).json({ message: 'Customer not found' });

    const updatedCustomer = await prisma.user.update({
      where: { id },
      data: { isSuspended: !customer.isSuspended }
    });

    res.json({ message: `Customer ${updatedCustomer.isSuspended ? 'suspended' : 'unsuspended'} successfully`, customer: updatedCustomer });
  } catch (error: any) {
    res.status(500).json({ message: 'Error toggling customer suspension', error: error.message });
  }
};
