// prisma/seed.ts
// import { prisma } from '@/lib/prisma';
// import { Product, Prisma } from '@prisma/client';
import { PrismaClient } from '@prisma/client';
// import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  // -------------------------------
  // 1️⃣ Seed Admin User
  // -------------------------------
  // const adminEmail = 'admin@example.com';
  // const existingAdmin = await prisma.user.findUnique({ where: { email: adminEmail } });

  // if (!existingAdmin) {
  //   const password = 'Admin@123!';
  //   const hashedPassword = await bcrypt.hash(password, 10);

  //   await prisma.user.create({
  //     data: {
  //       fullname: 'Super Admin',
  //       email: adminEmail,
  //       password: hashedPassword,
  //       role: 'ADMIN',
  //       mobile: '0000000000'
  //     }
  //   });

  //   console.log('✅ Admin user created');
  // } else {
  //   console.log('⚠️ Admin already exists, skipping...');
  // }

  // -------------------------------
  // 2️⃣ Seed Products
  // -------------------------------
  // Clear previous data
  await prisma.productVariant.deleteMany();
  await prisma.product.deleteMany();

  const colors = [
    { name: 'Black', code: '#000000', image: '/black.png' },
    { name: 'White', code: '#FFFFFF', image: '/white.png' },
    { name: 'Yellow', code: '#FFFF00', image: '/yellow.png' },
    { name: 'Red', code: '#FF0000', image: '/red.png' }
  ];

  const products = [
    {
      title: 'Cargo Trousers',
      variants: [
        { size: 'M', stock: 50, price: 45.99 },
        { size: 'L', stock: 30, price: 46.99 }
      ]
    },
    {
      title: 'Classic T-Shirt',
      variants: [
        { size: 'M', stock: 80, price: 19.99 },
        { size: 'L', stock: 120, price: 20.99 }
      ]
    },
    {
      title: 'Denim Jacket',
      variants: [
        { size: 'M', stock: 25, price: 89.5 },
        { size: 'L', stock: 30, price: 91 }
      ]
    },
    {
      title: 'Sneakers',
      variants: [
        { size: '41', stock: 60, price: 59 },
        { size: '42', stock: 75, price: 60 }
      ]
    },
    {
      title: 'Hoodie',
      variants: [
        { size: 'M', stock: 40, price: 39.99 },
        { size: 'L', stock: 30, price: 41 }
      ]
    },
    {
      title: 'Polo Shirt',
      variants: [
        { size: 'M', stock: 50, price: 29.99 },
        { size: 'L', stock: 65, price: 30.5 }
      ]
    },
    {
      title: 'Leather Jacket',
      variants: [
        { size: 'L', stock: 20, price: 120 },
        { size: 'XL', stock: 25, price: 125 }
      ]
    },
    {
      title: 'Running Shoes',
      variants: [
        { size: '42', stock: 60, price: 75 },
        { size: '43', stock: 80, price: 77 }
      ]
    },
    {
      title: 'Checked Shirt',
      variants: [
        { size: 'M', stock: 55, price: 35 },
        { size: 'L', stock: 45, price: 36 }
      ]
    },
    {
      title: 'Jeans Slim Fit',
      variants: [
        { size: '30', stock: 60, price: 55.5 },
        { size: '32', stock: 90, price: 56.5 }
      ]
    },
    {
      title: 'Green Hoodie',
      variants: [
        { size: 'M', stock: 35, price: 42 },
        { size: 'L', stock: 45, price: 43 }
      ]
    },
    {
      title: 'White Sneakers',
      variants: [
        { size: '40', stock: 70, price: 60 },
        { size: '41', stock: 85, price: 61 }
      ]
    },
    {
      title: 'Striped T-Shirt',
      variants: [
        { size: 'M', stock: 100, price: 22 },
        { size: 'L', stock: 80, price: 23 }
      ]
    },
    {
      title: 'Blue Jeans',
      variants: [
        { size: '32', stock: 100, price: 50 },
        { size: '34', stock: 110, price: 51 }
      ]
    },
    {
      title: 'Winter Coat',
      variants: [
        { size: 'L', stock: 25, price: 130 },
        { size: 'XL', stock: 20, price: 132 }
      ]
    },
    {
      title: 'Summer Hat',
      variants: [
        { size: 'M', stock: 50, price: 25 },
        { size: 'L', stock: 40, price: 26 }
      ]
    },
    {
      title: 'Leather Belt',
      variants: [
        { size: 'M', stock: 60, price: 35 },
        { size: 'L', stock: 50, price: 36 }
      ]
    },
    {
      title: 'Sports Cap',
      variants: [
        { size: 'One Size', stock: 70, price: 15 }
      ]
    },
    {
      title: 'Yoga Pants',
      variants: [
        { size: 'S', stock: 40, price: 30 },
        { size: 'M', stock: 50, price: 31 }
      ]
    },
    {
      title: 'Hooded Sweatshirt',
      variants: [
        { size: 'M', stock: 45, price: 40 },
        { size: 'L', stock: 30, price: 41 }
      ]
    }
  ];

  for (const product of products) {
    const variantsWithColors = [];
    for (const variant of product.variants) {
      for (const color of colors) {
        variantsWithColors.push({
          size: variant.size,
          stock: variant.stock,
          price: variant.price,
          colorName: color.name,
          colorCode: color.code,
          image: color.image
        });
      }
    }

    await prisma.product.create({
      data: {
        title: product.title,
        variants: {
          create: variantsWithColors
        }
      }
    });
  }

  console.log('Seed completed with 20+ products and 4 colors each!');
}

// Run main
main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
