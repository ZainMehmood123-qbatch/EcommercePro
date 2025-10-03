// prisma/seed.ts
// import { prisma } from '@/lib/prisma';
//import { Product,Prisma } from '@prisma/client';
import { PrismaClient } from '@prisma/client';
//import bcrypt from 'bcryptjs';
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
await prisma.product.deleteMany(); // remove old products

await prisma.product.createMany({
  data: [
    {
      title: 'Cargo Trousers',
      price: 45.99,
      image: '/myheadphone.png',
      colorName: 'Black',
      colorCode: '#000000',
      size: 'M',
      stock: 50
    },
    {
      title: 'Classic White T-Shirt',
      price: 19.99,
      image: '/mywooden.png',
      colorName: 'White',
      colorCode: '#FFFFFF',
      size: 'L',
      stock: 120
    },
    {
      title: 'Denim Jacket',
      price: 89.5,
      image: '/myheadphone.png',
      colorName: 'Blue',
      colorCode: '#0000FF',
      size: 'XL',
      stock: 30
    },
    {
      title: 'Black Sneakers',
      price: 59.0,
      image: '/mywooden.png',
      colorName: 'Black',
      colorCode: '#000000',
      size: '42',
      stock: 75
    },
    {
      title: 'Red Hoodie',
      price: 39.99,
      image: '/myheadphone.png',
      colorName: 'Red',
      colorCode: '#FF0000',
      size: 'M',
      stock: 40
    },
    {
      title: 'Blue Polo Shirt',
      price: 29.99,
      image: '/mywooden.png',
      colorName: 'Blue',
      colorCode: '#1E90FF',
      size: 'L',
      stock: 65
    },
    {
      title: 'Leather Jacket',
      price: 120.0,
      image: '/myheadphone.png',
      colorName: 'Brown',
      colorCode: '#654321',
      size: 'XL',
      stock: 25
    },
    {
      title: 'Running Shoes',
      price: 75.0,
      image: '/mywooden.png',
      colorName: 'Gray',
      colorCode: '#808080',
      size: '43',
      stock: 80
    },
    {
      title: 'Checked Shirt',
      price: 35.0,
      image: '/myheadphone.png',
      colorName: 'Green',
      colorCode: '#008000',
      size: 'M',
      stock: 55
    },
    {
      title: 'Jeans Slim Fit',
      price: 55.5,
      image: '/mywooden.png',
      colorName: 'Dark Blue',
      colorCode: '#00008B',
      size: '32',
      stock: 90
    },
    {
      title: 'Green Hoodie',
      price: 42.0,
      image: '/myheadphone.png',
      colorName: 'Green',
      colorCode: '#006400',
      size: 'L',
      stock: 45
    },
    {
      title: 'Black Leather Boots',
      price: 95.0,
      image: '/mywooden.png',
      colorName: 'Black',
      colorCode: '#000000',
      size: '44',
      stock: 30
    },
    {
      title: 'White Sneakers',
      price: 60.0,
      image: '/myheadphone.png',
      colorName: 'White',
      colorCode: '#FFFFFF',
      size: '41',
      stock: 85
    },
    {
      title: 'Striped T-Shirt',
      price: 22.0,
      image: '/mywooden.png',
      colorName: 'Navy',
      colorCode: '#000080',
      size: 'M',
      stock: 100
    },
    {
      title: 'Blue Jeans',
      price: 50.0,
      image: '/myheadphone.png',
      colorName: 'Blue',
      colorCode: '#1E90FF',
      size: '34',
      stock: 110
    },
    {
      title: 'Winter Coat',
      price: 130.0,
      image: '/mywooden.png',
      colorName: 'Gray',
      colorCode: '#696969',
      size: 'XL',
      stock: 20
    },
    {
      title: 'Formal Shoes',
      price: 85.0,
      image: '/myheadphone.png',
      colorName: 'Brown',
      colorCode: '#8B4513',
      size: '43',
      stock: 60
    },
    {
      title: 'Summer Hat',
      price: 15.0,
      image: '/mywooden.png',
      colorName: 'Beige',
      colorCode: '#F5F5DC',
      size: 'One Size',
      stock: 150
    },
    {
      title: 'Casual Shorts',
      price: 25.0,
      image: '/myheadphone.png',
      colorName: 'Khaki',
      colorCode: '#C3B091',
      size: 'M',
      stock: 95
    },
    {
      title: 'Graphic Hoodie',
      price: 40.0,
      image: '/mywooden.png',
      colorName: 'Black',
      colorCode: '#000000',
      size: 'L',
      stock: 50
    },
    {
      title: 'Leather Belt',
      price: 20.0,
      image: '/myheadphone.png',
      colorName: 'Brown',
      colorCode: '#A0522D',
      size: 'M',
      stock: 130
    },
    {
      title: 'Running Shorts',
      price: 18.0,
      image: '/mywooden.png',
      colorName: 'Blue',
      colorCode: '#4682B4',
      size: 'M',
      stock: 140
    },
    {
      title: 'Sports Jacket',
      price: 90.0,
      image: '/myheadphone.png',
      colorName: 'Navy',
      colorCode: '#000080',
      size: 'L',
      stock: 35
    },
    {
      title: 'Plaid Shirt',
      price: 38.0,
      image: '/mywooden.png',
      colorName: 'Red',
      colorCode: '#B22222',
      size: 'M',
      stock: 70
    },
    {
      title: 'Sneaker Socks',
      price: 10.0,
      image: '/myheadphone.png',
      colorName: 'White',
      colorCode: '#FFFFFF',
      size: 'Free Size',
      stock: 200
    },
    {
      title: 'Denim Shorts',
      price: 35.0,
      image: '/mywooden.png',
      colorName: 'Blue',
      colorCode: '#4169E1',
      size: 'L',
      stock: 65
    },
    {
      title: 'V-Neck T-Shirt',
      price: 21.0,
      image: '/myheadphone.png',
      colorName: 'Gray',
      colorCode: '#A9A9A9',
      size: 'M',
      stock: 115
    },
    {
      title: 'Hiking Boots',
      price: 110.0,
      image: '/mywooden.png',
      colorName: 'Brown',
      colorCode: '#5C4033',
      size: '45',
      stock: 25
    },
    {
      title: 'Rain Jacket',
      price: 75.0,
      image: '/myheadphone.png',
      colorName: 'Yellow',
      colorCode: '#FFD700',
      size: 'XL',
      stock: 40
    },
    {
      title: 'Beanie Hat',
      price: 12.0,
      image: '/mywooden.png',
      colorName: 'Black',
      colorCode: '#000000',
      size: 'One Size',
      stock: 180
    }
  ]
});

console.log('✅ Product seeding complete');
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
