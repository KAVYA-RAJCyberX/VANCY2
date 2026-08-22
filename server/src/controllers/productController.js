const Product = require('../models/Product');

// @desc    Fetch all products with filtering, sorting, search
// @route   GET /api/products
// @access  Public
const getProducts = async (req, res) => {
  try {
    const query = {};
    
    // Category filter
    if (req.query.category) {
      query.category = { $regex: new RegExp(req.query.category, 'i') };
    }
    
    // Luxury filter
    if (req.query.isLuxury === 'true') {
      query.isLuxury = true;
    }
    
    // Sale filter
    if (req.query.isSale === 'true') {
      query.isSale = true;
    }
    
    // New arrivals filter
    if (req.query.isNewArrival === 'true') {
      query.isNewArrival = true;
    }
    
    // Size filter
    if (req.query.size) {
      query['variants.size'] = req.query.size;
    }
    
    // Color filter
    if (req.query.color) {
      query['variants.color'] = { $regex: new RegExp(req.query.color, 'i') };
    }
    
    // Price range filter
    if (req.query.minPrice || req.query.maxPrice) {
      query.price = {};
      if (req.query.minPrice) query.price.$gte = Number(req.query.minPrice);
      if (req.query.maxPrice) query.price.$lte = Number(req.query.maxPrice);
    }
    
    // Text search
    if (req.query.search) {
      const searchRegex = new RegExp(req.query.search, 'i');
      query.$or = [
        { name: searchRegex },
        { description: searchRegex },
        { fabricDescription: searchRegex },
        { category: searchRegex },
      ];
    }
    
    // Sorting
    let sort = {};
    if (req.query.sort) {
      const sortField = req.query.sort.startsWith('-') ? req.query.sort.substring(1) : req.query.sort;
      const sortOrder = req.query.sort.startsWith('-') ? -1 : 1;
      sort[sortField] = sortOrder;
    } else {
      sort = { createdAt: -1 };
    }
    
    // Pagination
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 50;
    const skip = (page - 1) * limit;
    
    const products = await Product.find(query)
      .select({
        name: 1,
        slug: 1,
        price: 1,
        originalPrice: 1,
        fabricDescription: 1,
        category: 1,
        isSale: 1,
        isNewArrival: 1,
        images: { $slice: 2 }
      })
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .lean();
    const total = await Product.countDocuments(query);
    
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch products', error: error.message });
  }
};

// @desc    Fetch single product
// @route   GET /api/products/:slug
// @access  Public
const getProductBySlug = async (req, res) => {
  try {
    const product = await Product.findOne({ slug: req.params.slug }).lean();

    if (product) {
      res.json(product);
    } else {
      res.status(404).json({ message: 'Product not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch product', error: error.message });
  }
};

module.exports = { getProducts, getProductBySlug };
