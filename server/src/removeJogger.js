const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Product = require('./models/Product');

dotenv.config();

const removeJogger = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB Connected');

    // Remove Forest Green Jogger
    const result = await Product.deleteOne({ slug: 'forest-green-ribbed-cuff-jogger' });
    console.log(`Deleted ${result.deletedCount} products`);

    console.log('Forest Green Jogger removed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

removeJogger();
