import { Request as ExpressRequest, Response as ExpressResponse } from 'express';
import prisma from '../prisma';

export const subscribeNewsletter = async (req: ExpressRequest, res: ExpressResponse): Promise<void> => {
  try {
    const { email } = req.body;

    if (!email || !email.includes('@')) {
      res.status(400).json({ success: false, message: 'Valid email address is required' });
      return;
    }

    // Check if already subscribed
    const existingSubscriber = await prisma.newsletterSubscriber.findUnique({
      where: { email },
    });

    if (existingSubscriber) {
      res.status(400).json({ success: false, message: 'Email is already subscribed to the newsletter' });
      return;
    }

    // Subscribe
    await prisma.newsletterSubscriber.create({
      data: { email },
    });

    res.status(201).json({ success: true, message: 'Successfully subscribed to the newsletter' });
  } catch (error: any) {
    console.error('Error subscribing to newsletter:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};
