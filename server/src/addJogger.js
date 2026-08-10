const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Product = require('./models/Product');
const User = require('./models/User');

dotenv.config();

const addJogger = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB Connected');

    const adminUser = await User.findOne({ email: 'chouhankavyaraj721@gmail.com' });
    
    if (!adminUser) {
        console.error('Admin user not found');
        process.exit(1);
    }

    const greenJogger = {
        name: 'Forest Green Ribbed-Cuff Jogger',
        slug: 'forest-green-ribbed-cuff-jogger',
        description: 'Bold forest green in a structured silhouette. Ribbed cuffs with contrast inner tape, welt pockets, and a flat-drawcord waist for a premium look.',
        images: ['/images/joggers/green/green.png'],
        fabricDescription: 'Organic Cotton Loopback Terry',
        fabric: 'Loopback Terry',
        category: 'Joggers',
        price: 1990,
        rating: 4.8,
        numReviews: 11,
        isNewArrival: true,
        sizeChartType: 'jogger',
        sizes: ['S', 'M', 'L', 'XL'],
        colors: ['Forest Green'],
        variants: [
          { size: 'S', color: 'Forest Green', stock: 5 },
          { size: 'M', color: 'Forest Green', stock: 12 },
          { size: 'L', color: 'Forest Green', stock: 9 },
        ],
        user: adminUser._id
    };

    await Product.create(greenJogger);
    console.log('Forest Green Jogger re-added successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

addJogger();
