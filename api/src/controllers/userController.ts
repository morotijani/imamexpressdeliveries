import { Request, Response } from 'express';
import prisma from '../prisma';
import bcrypt from 'bcrypt';

export const getProfile = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.userId;
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
        profileImage: true,
        role: true,
        createdAt: true
      }
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ user });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching profile', error });
  }
};

export const updateProfile = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.userId;
    const { name, phone, email, profileImage } = req.body;

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        name,
        phone,
        email,
        profileImage
      },
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
        profileImage: true,
        role: true
      }
    });

    res.json({ message: 'Profile updated successfully', user: updatedUser });
  } catch (error: any) {
    if (error.code === 'P2002') {
      return res.status(400).json({ message: 'Email already in use' });
    }
    res.status(500).json({ message: 'Error updating profile', error });
  }
};
export const changePassword = async (req: Request, res: Response): Promise<any> => {
  try {
    const userId = (req as any).user.userId;
    const { currentPassword, newPassword } = req.body;

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) return res.status(404).json({ message: 'User not found' });

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Incorrect current password' });

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword }
    });

    res.json({ message: 'Password updated successfully' });
  } catch (error: any) {
    res.status(500).json({ message: 'Error updating password', error: error.message });
  }
};
