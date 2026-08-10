const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Product = require('./models/Product');

dotenv.config();

const updateJoggers = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB Connected');

    // Update Sand
    await Product.updateOne(
      { slug: 'sand-relaxed-fit-jogger' },
      { $set: { images: ['/images/joggers/sand/sand relaxed.png'] } }
    );
    console.log('Updated Sand Jogger');

    // Update Stone Gray
    await Product.updateOne(
      { slug: 'stone-gray-french-terry-jogger' },
      { $set: { images: ['/images/joggers/grey/stone grey.png'] } }
    );
    console.log('Updated Stone Gray Jogger');

    console.log('Jogger images updated successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

updateJoggers();
