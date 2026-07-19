const mongoose = require('mongoose');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const User = require('./models/User');
const Product = require('./models/Product');
const Order = require('./models/Order');
const Category = require('./models/Category');
const Coupon = require('./models/Coupon');
const Review = require('./models/Review');
const products = require('./data/products');

dotenv.config();

connectDB();

const importData = async () => {
  try {
    await Order.deleteMany();
    await Product.deleteMany();
    await User.deleteMany();
    await Category.deleteMany();
    await Coupon.deleteMany();
    await Review.deleteMany();

    const createdUsers = await User.insertMany([
      {
        name: 'Admin User',
        email: 'admin@vancy.com',
        password: 'password123',
        isAdmin: true,
      },
      {
        name: 'Test User',
        email: 'test@vancy.com',
        password: 'password123',
      }
    ]);

    const adminUser = createdUsers[0]._id;
    const testUser = createdUsers[1]._id;

    // Seed products
    const sampleProducts = products.map((product) => {
      return { ...product, user: adminUser };
    });
    const createdProducts = await Product.insertMany(sampleProducts);

    // Seed categories
    await Category.insertMany([
      { name: 'Polo Shirts', slug: 'polos', description: 'Premium polo shirts crafted with the finest fabrics' },
      { name: 'Joggers', slug: 'joggers', description: 'Luxury joggers for the modern gentleman' },
      { name: 'Accessories', slug: 'accessories', description: 'Complementary accessories for the VANCY lifestyle' },
      { name: 'New Arrivals', slug: 'new', description: 'The latest additions to our collection' },
      { name: 'Sale', slug: 'sale', description: 'Premium items at exceptional prices' },
    ]);

    // Seed coupons
    await Coupon.insertMany([
      {
        code: 'WELCOME10',
        discountType: 'percentage',
        discountValue: 10,
        maxDiscount: 500,
        minPurchase: 1000,
        isActive: true,
        expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year
      },
      {
        code: 'FLAT200',
        discountType: 'fixed',
        discountValue: 200,
        minPurchase: 1500,
        isActive: true,
        expiresAt: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 90 days
      },
      {
        code: 'LUXURY15',
        discountType: 'percentage',
        discountValue: 15,
        maxDiscount: 1000,
        minPurchase: 2000,
        isActive: true,
        expiresAt: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000), // 6 months
      },
    ]);

    // Seed sample reviews
    const reviewProducts = createdProducts.slice(0, 4);
    const sampleReviews = [
      { user: testUser, product: reviewProducts[0]._id, name: 'Arjun K.', rating: 5, comment: 'Exceptional quality. The fabric feels incredibly premium and the fit is perfect. Worth every rupee.' },
      { user: testUser, product: reviewProducts[0]._id, name: 'Rahul M.', rating: 4, comment: 'Great polo, love the embroidery detail. Slightly long for my frame but overall fantastic.' },
      { user: testUser, product: reviewProducts[1]._id, name: 'Vikram S.', rating: 5, comment: 'The merino blend is buttery soft. This is my third VANCY polo and the quality is always consistent.' },
      { user: testUser, product: reviewProducts[2]._id, name: 'Karan P.', rating: 5, comment: 'The velvet touch is unreal. Wore this to a dinner party and got so many compliments.' },
      { user: testUser, product: reviewProducts[3]._id, name: 'Aditya R.', rating: 5, comment: 'Best polo I have ever owned. The organic cotton breathes beautifully even in Indian summers.' },
    ];
    await Review.insertMany(sampleReviews);

    console.log('Data Imported!');
    console.log(`  - ${createdProducts.length} products (including 6 joggers)`);
    console.log('  - 5 categories');
    console.log('  - 3 coupons (WELCOME10, FLAT200, LUXURY15)');
    console.log('  - 5 sample reviews');
    console.log('  - 2 users (admin@vancy.com / test@vancy.com)');
    process.exit();
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

const destroyData = async () => {
  try {
    await Order.deleteMany();
    await Product.deleteMany();
    await User.deleteMany();
    await Category.deleteMany();
    await Coupon.deleteMany();
    await Review.deleteMany();

    console.log('Data Destroyed!');
    process.exit();
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

if (process.argv[2] === '-d') {
  destroyData();
} else {
  importData();
}
