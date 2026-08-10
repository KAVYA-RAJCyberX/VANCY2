const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Product = require('./models/Product');

dotenv.config();

const updateJoggers = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB Connected');

    // Update Charcoal
    await Product.updateOne(
      { slug: 'charcoal-tapered-jogger' },
      { $set: { images: ['/images/joggers/Charcoal/Charcoal Tapered Jogger.png'] } }
    );
    console.log('Updated Charcoal Jogger');

    // Update Navy Signature
    await Product.updateOne(
      { slug: 'navy-signature-jogger' },
      { $set: { images: ['/images/joggers/navy/Navy Signature Jogger.png', '/images/joggers/navy/Navy Signature Jogger-near.png'] } }
    );
    console.log('Updated Navy Signature Jogger');

    // Update Obsidian Black
    await Product.updateOne(
      { slug: 'obsidian-black-slim-jogger' },
      { $set: { images: ['/images/joggers/black/Obsidian Black Slim Jogger.png', '/images/joggers/black/Obsidian Black Slim Jogger-near.png'] } }
    );
    console.log('Updated Obsidian Black Jogger');

    console.log('Jogger images updated successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

updateJoggers();
