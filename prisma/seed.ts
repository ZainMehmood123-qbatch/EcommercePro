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

  // const products = [
  //   {
  //     title: 'Cargo Trousers',
  //     variants: [
  //       { size: 'M', stock: 50, price: 45.99 },
  //       { size: 'L', stock: 30, price: 46.99 }
  //     ]
  //   },
  //   {
  //     title: 'Classic T-Shirt',
  //     variants: [
  //       { size: 'M', stock: 80, price: 19.99 },
  //       { size: 'L', stock: 120, price: 20.99 }
  //     ]
  //   },
  //   {
  //     title: 'Denim Jacket',
  //     variants: [
  //       { size: 'M', stock: 25, price: 89.5 },
  //       { size: 'L', stock: 30, price: 91 }
  //     ]
  //   },
  //   {
  //     title: 'Sneakers',
  //     variants: [
  //       { size: '41', stock: 60, price: 59 },
  //       { size: '42', stock: 75, price: 60 }
  //     ]
  //   },
  //   {
  //     title: 'Hoodie',
  //     variants: [
  //       { size: 'M', stock: 40, price: 39.99 },
  //       { size: 'L', stock: 30, price: 41 }
  //     ]
  //   },
  //   {
  //     title: 'Polo Shirt',
  //     variants: [
  //       { size: 'M', stock: 50, price: 29.99 },
  //       { size: 'L', stock: 65, price: 30.5 }
  //     ]
  //   },
  //   {
  //     title: 'Leather Jacket',
  //     variants: [
  //       { size: 'L', stock: 20, price: 120 },
  //       { size: 'XL', stock: 25, price: 125 }
  //     ]
  //   },
  //   {
  //     title: 'Running Shoes',
  //     variants: [
  //       { size: '42', stock: 60, price: 75 },
  //       { size: '43', stock: 80, price: 77 }
  //     ]
  //   },
  //   {
  //     title: 'Checked Shirt',
  //     variants: [
  //       { size: 'M', stock: 55, price: 35 },
  //       { size: 'L', stock: 45, price: 36 }
  //     ]
  //   },
  //   {
  //     title: 'Jeans Slim Fit',
  //     variants: [
  //       { size: '30', stock: 60, price: 55.5 },
  //       { size: '32', stock: 90, price: 56.5 }
  //     ]
  //   },
  //   {
  //     title: 'Green Hoodie',
  //     variants: [
  //       { size: 'M', stock: 35, price: 42 },
  //       { size: 'L', stock: 45, price: 43 }
  //     ]
  //   },
  //   {
  //     title: 'White Sneakers',
  //     variants: [
  //       { size: '40', stock: 70, price: 60 },
  //       { size: '41', stock: 85, price: 61 }
  //     ]
  //   },
  //   {
  //     title: 'Striped T-Shirt',
  //     variants: [
  //       { size: 'M', stock: 100, price: 22 },
  //       { size: 'L', stock: 80, price: 23 }
  //     ]
  //   },
  //   {
  //     title: 'Blue Jeans',
  //     variants: [
  //       { size: '32', stock: 100, price: 50 },
  //       { size: '34', stock: 110, price: 51 }
  //     ]
  //   },
  //   {
  //     title: 'Winter Coat',
  //     variants: [
  //       { size: 'L', stock: 25, price: 130 },
  //       { size: 'XL', stock: 20, price: 132 }
  //     ]
  //   },
  //   {
  //     title: 'Summer Hat',
  //     variants: [
  //       { size: 'M', stock: 50, price: 25 },
  //       { size: 'L', stock: 40, price: 26 }
  //     ]
  //   },
  //   {
  //     title: 'Leather Belt',
  //     variants: [
  //       { size: 'M', stock: 60, price: 35 },
  //       { size: 'L', stock: 50, price: 36 }
  //     ]
  //   },
  //   {
  //     title: 'Sports Cap',
  //     variants: [
  //       { size: 'One Size', stock: 70, price: 15 }
  //     ]
  //   },
  //   {
  //     title: 'Yoga Pants',
  //     variants: [
  //       { size: 'S', stock: 40, price: 30 },
  //       { size: 'M', stock: 50, price: 31 }
  //     ]
  //   },
  //   {
  //     title: 'Hooded Sweatshirt',
  //     variants: [
  //       { size: 'M', stock: 45, price: 40 },
  //       { size: 'L', stock: 30, price: 41 }
  //     ]
  //   }
  // ];

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
    { title: 'Sports Cap', variants: [{ size: 'One Size', stock: 70, price: 15 }] },
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
    },
    {
      title: 'Graphic Tee',
      variants: [
        { size: 'S', stock: 70, price: 21 },
        { size: 'M', stock: 85, price: 22 }
      ]
    },
    {
      title: 'Slim Chinos',
      variants: [
        { size: '30', stock: 55, price: 49.5 },
        { size: '32', stock: 65, price: 50.5 }
      ]
    },
    {
      title: 'Wool Sweater',
      variants: [
        { size: 'M', stock: 35, price: 70 },
        { size: 'L', stock: 40, price: 72 }
      ]
    },
    {
      title: 'Running Shorts',
      variants: [
        { size: 'S', stock: 80, price: 25 },
        { size: 'M', stock: 90, price: 26 }
      ]
    },
    {
      title: 'Puffer Jacket',
      variants: [
        { size: 'L', stock: 20, price: 110 },
        { size: 'XL', stock: 25, price: 115 }
      ]
    },
    {
      title: 'Denim Shorts',
      variants: [
        { size: '30', stock: 60, price: 40 },
        { size: '32', stock: 70, price: 42 }
      ]
    },
    {
      title: 'Formal Shirt',
      variants: [
        { size: 'M', stock: 75, price: 35 },
        { size: 'L', stock: 65, price: 36 }
      ]
    },
    {
      title: 'Cotton Shorts',
      variants: [
        { size: 'M', stock: 80, price: 29 },
        { size: 'L', stock: 70, price: 30 }
      ]
    },
    {
      title: 'Tracksuit',
      variants: [
        { size: 'M', stock: 45, price: 65 },
        { size: 'L', stock: 35, price: 67 }
      ]
    },
    {
      title: 'Windbreaker',
      variants: [
        { size: 'M', stock: 40, price: 55 },
        { size: 'L', stock: 45, price: 56 }
      ]
    },
    {
      title: 'Casual Blazer',
      variants: [
        { size: 'L', stock: 25, price: 90 },
        { size: 'XL', stock: 30, price: 92 }
      ]
    },
    {
      title: 'Tank Top',
      variants: [
        { size: 'S', stock: 100, price: 18 },
        { size: 'M', stock: 90, price: 19 }
      ]
    },
    {
      title: 'Trench Coat',
      variants: [
        { size: 'M', stock: 20, price: 140 },
        { size: 'L', stock: 25, price: 145 }
      ]
    },
    {
      title: 'Cardigan',
      variants: [
        { size: 'M', stock: 40, price: 50 },
        { size: 'L', stock: 45, price: 52 }
      ]
    },
    { title: 'Baseball Cap', variants: [{ size: 'One Size', stock: 80, price: 17 }] },
    { title: 'Wool Scarf', variants: [{ size: 'One Size', stock: 60, price: 25 }] },
    {
      title: 'Running Jacket',
      variants: [
        { size: 'M', stock: 50, price: 60 },
        { size: 'L', stock: 45, price: 62 }
      ]
    },
    {
      title: 'Casual Shoes',
      variants: [
        { size: '42', stock: 55, price: 65 },
        { size: '43', stock: 60, price: 67 }
      ]
    },
    {
      title: 'Dress Pants',
      variants: [
        { size: '32', stock: 45, price: 75 },
        { size: '34', stock: 40, price: 77 }
      ]
    },
    {
      title: 'Raincoat',
      variants: [
        { size: 'M', stock: 30, price: 85 },
        { size: 'L', stock: 25, price: 88 }
      ]
    },
    {
      title: 'Sweatpants',
      variants: [
        { size: 'M', stock: 70, price: 32 },
        { size: 'L', stock: 60, price: 33 }
      ]
    },
    {
      title: 'Polo Dress',
      variants: [
        { size: 'S', stock: 40, price: 55 },
        { size: 'M', stock: 45, price: 56 }
      ]
    },
    {
      title: 'Crewneck Sweatshirt',
      variants: [
        { size: 'M', stock: 50, price: 39 },
        { size: 'L', stock: 45, price: 40 }
      ]
    },
    {
      title: 'Canvas Sneakers',
      variants: [
        { size: '40', stock: 70, price: 58 },
        { size: '41', stock: 60, price: 59 }
      ]
    },
    {
      title: 'Slim Fit Shirt',
      variants: [
        { size: 'M', stock: 75, price: 34 },
        { size: 'L', stock: 65, price: 35 }
      ]
    },
    { title: 'Knitted Beanie', variants: [{ size: 'One Size', stock: 90, price: 12 }] },
    {
      title: 'Casual Shorts',
      variants: [
        { size: 'M', stock: 60, price: 28 },
        { size: 'L', stock: 55, price: 29 }
      ]
    },
    {
      title: 'Leather Gloves',
      variants: [
        { size: 'M', stock: 35, price: 40 },
        { size: 'L', stock: 30, price: 42 }
      ]
    },
    {
      title: 'Formal Blazer',
      variants: [
        { size: 'L', stock: 20, price: 120 },
        { size: 'XL', stock: 25, price: 125 }
      ]
    },
    {
      title: 'Joggers',
      variants: [
        { size: 'M', stock: 50, price: 37 },
        { size: 'L', stock: 45, price: 38 }
      ]
    },
    {
      title: 'Track Jacket',
      variants: [
        { size: 'M', stock: 55, price: 48 },
        { size: 'L', stock: 50, price: 49 }
      ]
    },
    {
      title: 'Sports Hoodie',
      variants: [
        { size: 'M', stock: 40, price: 42 },
        { size: 'L', stock: 35, price: 43 }
      ]
    },
    {
      title: 'Denim Shirt',
      variants: [
        { size: 'M', stock: 60, price: 38 },
        { size: 'L', stock: 55, price: 39 }
      ]
    },
    {
      title: 'Cotton Pajamas',
      variants: [
        { size: 'M', stock: 70, price: 35 },
        { size: 'L', stock: 60, price: 36 }
      ]
    },
    {
      title: 'Wool Coat',
      variants: [
        { size: 'L', stock: 20, price: 125 },
        { size: 'XL', stock: 25, price: 130 }
      ]
    },
    {
      title: 'Linen Shirt',
      variants: [
        { size: 'M', stock: 65, price: 33 },
        { size: 'L', stock: 55, price: 34 }
      ]
    },
    {
      title: 'Casual Vest',
      variants: [
        { size: 'M', stock: 40, price: 45 },
        { size: 'L', stock: 35, price: 47 }
      ]
    },
    {
      title: 'Ankle Boots',
      variants: [
        { size: '42', stock: 40, price: 85 },
        { size: '43', stock: 35, price: 87 }
      ]
    },
    {
      title: 'Bomber Jacket',
      variants: [
        { size: 'M', stock: 25, price: 95 },
        { size: 'L', stock: 30, price: 97 }
      ]
    },
    {
      title: 'Beach Shorts',
      variants: [
        { size: 'M', stock: 80, price: 26 },
        { size: 'L', stock: 70, price: 27 }
      ]
    },
    { title: 'Wool Hat', variants: [{ size: 'One Size', stock: 50, price: 18 }] },
    {
      title: 'Graphic Hoodie',
      variants: [
        { size: 'M', stock: 45, price: 44 },
        { size: 'L', stock: 40, price: 45 }
      ]
    },
    {
      title: 'Running Tights',
      variants: [
        { size: 'S', stock: 60, price: 33 },
        { size: 'M', stock: 55, price: 34 }
      ]
    },
    {
      title: 'Fleece Jacket',
      variants: [
        { size: 'M', stock: 35, price: 75 },
        { size: 'L', stock: 40, price: 77 }
      ]
    },
    {
      title: 'Graphic Sweatshirt',
      variants: [
        { size: 'M', stock: 65, price: 38 },
        { size: 'L', stock: 60, price: 39 }
      ]
    },
    { title: 'Wool Socks', variants: [{ size: 'One Size', stock: 100, price: 10 }] },
    {
      title: 'Summer Shorts',
      variants: [
        { size: 'M', stock: 75, price: 28 },
        { size: 'L', stock: 70, price: 29 }
      ]
    },
    {
      title: 'Canvas Shoes',
      variants: [
        { size: '41', stock: 65, price: 55 },
        { size: '42', stock: 70, price: 56 }
      ]
    },
    {
      title: 'V-Neck T-Shirt',
      variants: [
        { size: 'S', stock: 90, price: 20 },
        { size: 'M', stock: 85, price: 21 }
      ]
    },
    {
      title: 'Fur Coat',
      variants: [
        { size: 'L', stock: 15, price: 150 },
        { size: 'XL', stock: 20, price: 155 }
      ]
    },
    {
      title: 'Chino Pants',
      variants: [
        { size: '30', stock: 50, price: 48 },
        { size: '32', stock: 60, price: 49 }
      ]
    },
    {
      title: 'Cotton Hoodie',
      variants: [
        { size: 'M', stock: 55, price: 42 },
        { size: 'L', stock: 50, price: 43 }
      ]
    },
    {
      title: 'Denim Overalls',
      variants: [
        { size: 'M', stock: 40, price: 70 },
        { size: 'L', stock: 35, price: 72 }
      ]
    },
    {
      title: 'Classic Jeans',
      variants: [
        { size: '32', stock: 95, price: 54 },
        { size: '34', stock: 85, price: 55 }
      ]
    },
    {
      title: 'Cargo Shorts',
      variants: [
        { size: 'M', stock: 65, price: 35 },
        { size: 'L', stock: 55, price: 36 }
      ]
    },
    {
      title: 'Longline Shirt',
      variants: [
        { size: 'M', stock: 60, price: 37 },
        { size: 'L', stock: 55, price: 38 }
      ]
    },
    {
      title: 'Zip Hoodie',
      variants: [
        { size: 'M', stock: 50, price: 43 },
        { size: 'L', stock: 45, price: 44 }
      ]
    },
    {
      title: 'Running Tank',
      variants: [
        { size: 'S', stock: 70, price: 24 },
        { size: 'M', stock: 75, price: 25 }
      ]
    },
    {
      title: 'Canvas Jacket',
      variants: [
        { size: 'M', stock: 30, price: 80 },
        { size: 'L', stock: 25, price: 82 }
      ]
    },
    {
      title: 'Printed Shirt',
      variants: [
        { size: 'M', stock: 75, price: 33 },
        { size: 'L', stock: 65, price: 34 }
      ]
    },
    { title: 'Crew Socks', variants: [{ size: 'One Size', stock: 120, price: 8 }] },
    {
      title: 'Tennis Shoes',
      variants: [
        { size: '41', stock: 70, price: 68 },
        { size: '42', stock: 60, price: 69 }
      ]
    },
    {
      title: 'Wool Gloves',
      variants: [
        { size: 'M', stock: 35, price: 32 },
        { size: 'L', stock: 30, price: 33 }
      ]
    },
    {
      title: 'Slim Shorts',
      variants: [
        { size: 'M', stock: 60, price: 31 },
        { size: 'L', stock: 50, price: 32 }
      ]
    },
    {
      title: 'Fleece Hoodie',
      variants: [
        { size: 'M', stock: 40, price: 45 },
        { size: 'L', stock: 35, price: 46 }
      ]
    },
    {
      title: 'Cotton Tank',
      variants: [
        { size: 'S', stock: 90, price: 19 },
        { size: 'M', stock: 85, price: 20 }
      ]
    },
    {
      title: 'Slip-On Shoes',
      variants: [
        { size: '41', stock: 65, price: 57 },
        { size: '42', stock: 70, price: 58 }
      ]
    },
    {
      title: 'Graphic Shorts',
      variants: [
        { size: 'M', stock: 60, price: 28 },
        { size: 'L', stock: 55, price: 29 }
      ]
    },
    {
      title: 'Sweat Shorts',
      variants: [
        { size: 'M', stock: 75, price: 30 },
        { size: 'L', stock: 70, price: 31 }
      ]
    },
    {
      title: 'Casual Hoodie',
      variants: [
        { size: 'M', stock: 50, price: 41 },
        { size: 'L', stock: 45, price: 42 }
      ]
    },
    {
      title: 'Running Hoodie',
      variants: [
        { size: 'M', stock: 55, price: 44 },
        { size: 'L', stock: 50, price: 45 }
      ]
    },
    {
      title: 'Lightweight Jacket',
      variants: [
        { size: 'M', stock: 35, price: 78 },
        { size: 'L', stock: 30, price: 79 }
      ]
    },
    {
      title: 'Cotton Shorts',
      variants: [
        { size: 'M', stock: 80, price: 29 },
        { size: 'L', stock: 70, price: 30 }
      ]
    },
    {
      title: 'Graphic T-Shirt',
      variants: [
        { size: 'M', stock: 90, price: 22 },
        { size: 'L', stock: 80, price: 23 }
      ]
    },
    {
      title: 'Jogging Pants',
      variants: [
        { size: 'M', stock: 65, price: 36 },
        { size: 'L', stock: 55, price: 37 }
      ]
    },
    {
      title: 'Printed Hoodie',
      variants: [
        { size: 'M', stock: 40, price: 43 },
        { size: 'L', stock: 35, price: 44 }
      ]
    },
    {
      title: 'Summer Shirt',
      variants: [
        { size: 'M', stock: 75, price: 34 },
        { size: 'L', stock: 70, price: 35 }
      ]
    },
    {
      title: 'Linen Pants',
      variants: [
        { size: '32', stock: 60, price: 50 },
        { size: '34', stock: 55, price: 51 }
      ]
    },
    {
      title: 'Crew T-Shirt',
      variants: [
        { size: 'S', stock: 85, price: 20 },
        { size: 'M', stock: 90, price: 21 }
      ]
    },
    {
      title: 'Rain Jacket',
      variants: [
        { size: 'M', stock: 25, price: 88 },
        { size: 'L', stock: 30, price: 90 }
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
