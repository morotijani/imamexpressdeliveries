import { PrismaClient, Role, OrderStatus } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database with dummy data...');

  // Hash a default password for all users
  const password = await bcrypt.hash('password123', 10);

  // 1. Create Admin
  const admin = await prisma.user.upsert({
    where: { email: 'admin@imamexpress.com' },
    update: {},
    create: {
      email: 'admin@imamexpress.com',
      name: 'System Admin',
      phone: '+10000000001',
      password,
      role: Role.ADMIN,
    },
  });
  console.log(`Created Admin: ${admin.email}`);

  // 2. Create Riders
  const rider1 = await prisma.user.upsert({
    where: { email: 'rider1@imamexpress.com' },
    update: {},
    create: {
      email: 'rider1@imamexpress.com',
      name: 'John Rider',
      phone: '+10000000002',
      password,
      role: Role.RIDER,
    },
  });
  const rider2 = await prisma.user.upsert({
    where: { email: 'rider2@imamexpress.com' },
    update: {},
    create: {
      email: 'rider2@imamexpress.com',
      name: 'Sarah Fast',
      phone: '+10000000003',
      password,
      role: Role.RIDER,
    },
  });
  console.log(`Created Riders: ${rider1.email}, ${rider2.email}`);

  // 3. Create Customers
  const customer1 = await prisma.user.upsert({
    where: { email: 'customer1@imamexpress.com' },
    update: {},
    create: {
      email: 'customer1@imamexpress.com',
      name: 'Alice Shopper',
      phone: '+10000000004',
      password,
      role: Role.CUSTOMER,
    },
  });
  const customer2 = await prisma.user.upsert({
    where: { email: 'customer2@imamexpress.com' },
    update: {},
    create: {
      email: 'customer2@imamexpress.com',
      name: 'Bob Business',
      phone: '+10000000005',
      password,
      role: Role.CUSTOMER,
    },
  });
  console.log(`Created Customers: ${customer1.email}, ${customer2.email}`);

  // 4. Set Pricing Config
  await prisma.pricingConfig.deleteMany({}); // clear existing
  const pricing = await prisma.pricingConfig.create({
    data: {
      baseRate: 5.0,
      perKmRate: 1.5,
      expressMultiplier: 1.5,
    },
  });
  console.log(`Created Pricing Config`);

  // 5. Create Orders
  await prisma.order.deleteMany({}); // clear existing

  const ordersData = [
    {
      pickupLocation: '123 Market St, City Center',
      dropoffLocation: '456 Residential Ave, Suburbs',
      receiverName: 'Charlie',
      receiverContact: '+1234567890',
      packageDescription: 'Electronics, fragile',
      status: OrderStatus.PENDING,
      price: 15.5,
      distance: 7,
      customerId: customer1.id,
    },
    {
      pickupLocation: 'Warehouse A, Industrial Park',
      dropoffLocation: 'Downtown Office Complex',
      receiverName: 'Diana',
      receiverContact: '+1987654321',
      packageDescription: 'Important documents',
      status: OrderStatus.ASSIGNED,
      price: 8.0,
      distance: 2,
      customerId: customer2.id,
      riderId: rider1.id,
    },
    {
      pickupLocation: 'Main Library',
      dropoffLocation: 'University Campus',
      receiverName: 'Eve',
      receiverContact: '+1122334455',
      packageDescription: 'Books',
      status: OrderStatus.PICKED_UP,
      price: 12.5,
      distance: 5,
      customerId: customer1.id,
      riderId: rider2.id,
    },
    {
      pickupLocation: 'Central Mall',
      dropoffLocation: 'Northside Apartments',
      receiverName: 'Frank',
      receiverContact: '+1555666777',
      packageDescription: 'Clothing',
      status: OrderStatus.DELIVERED,
      price: 20.0,
      distance: 10,
      customerId: customer2.id,
      riderId: rider1.id,
    },
    {
      pickupLocation: 'South Airport Terminal',
      dropoffLocation: 'Grand Hotel',
      receiverName: 'Grace',
      receiverContact: '+1999888777',
      packageDescription: 'Luggage',
      status: OrderStatus.DELIVERED,
      price: 35.0,
      distance: 20,
      customerId: customer1.id,
      riderId: rider2.id,
    },
  ];

  for (const order of ordersData) {
    await prisma.order.create({ data: order });
  }
  console.log(`Created ${ordersData.length} Orders`);

  console.log('Seeding completed!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
