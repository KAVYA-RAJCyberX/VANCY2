const products = [
  {
    name: 'Mustard Yellow Artisan Polo',
    slug: 'mustard-yellow-artisan-polo',
    images: ['/images/mustard.png'],
    fabricDescription: '100% Pima Cotton Piqué',
    category: 'Polo Shirts',
    subCategory: 'Artisan',
    price: 709,
    originalPrice: 1180,
    rating: 4.5,
    numReviews: 12,
    isNewArrival: true,
    variants: [
      { size: 'M', color: 'Mustard Yellow', stock: 10 },
      { size: 'L', color: 'Mustard Yellow', stock: 5 }
    ]
  },
  {
    name: 'Light Gray Essential Polo',
    slug: 'light-gray-essential-polo',
    images: ['/images/gray.png'],
    fabricDescription: 'Premium Merino Wool Blend',
    category: 'Polo Shirts',
    subCategory: 'Essential',
    price: 840,
    originalPrice: 1200,
    rating: 4.8,
    numReviews: 8,
    isNewArrival: false,
    variants: [
      { size: 'S', color: 'Light Gray', stock: 2 },
      { size: 'M', color: 'Light Gray', stock: 0 }
    ]
  },
  {
    name: 'Navy Blue Velvet Classic',
    slug: 'navy-blue-velvet-classic',
    images: ['/images/navy.png'],
    fabricDescription: 'Soft Touch Velvet Cotton',
    category: 'Polo Shirts',
    subCategory: 'Velvet',
    price: 899,
    rating: 4.9,
    numReviews: 24,
    isNewArrival: false,
    variants: [
      { size: 'M', color: 'Navy Blue', stock: 15 },
      { size: 'XL', color: 'Navy Blue', stock: 8 }
    ]
  },
  {
    name: 'Deep Green Timeless Polo',
    slug: 'deep-green-timeless-polo',
    images: ['/images/green.png'],
    fabricDescription: 'Organic Breathable Cotton',
    category: 'Polo Shirts',
    subCategory: 'Timeless',
    price: 940,
    rating: 5.0,
    numReviews: 32,
    isNewArrival: true,
    variants: [
      { size: 'L', color: 'Deep Green', stock: 4 },
      { size: 'XL', color: 'Deep Green', stock: 7 }
    ]
  },
  {
    name: 'Cashmere Blend Elite Polo',
    slug: 'cashmere-blend-elite-polo',
    images: ['/images/black.png'], // Reusing a fallback image or new one
    fabricDescription: 'Italian Cashmere & Silk Blend',
    category: 'Polo Shirts',
    subCategory: 'Luxury',
    price: 3200,
    originalPrice: 3500,
    rating: 5.0,
    numReviews: 4,
    isNewArrival: true,
    isLuxury: true,
    luxuryTier: 'Black',
    limitedEdition: 50,
    limitedEditionStock: 12,
    variants: [
      { size: 'M', color: 'Midnight Black', stock: 5 },
      { size: 'L', color: 'Midnight Black', stock: 7 }
    ]
  },
  {
    name: 'Merino Wool Privé Edition',
    slug: 'merino-wool-prive-edition',
    images: ['/images/gray.png'],
    fabricDescription: '100% Extrafine Merino Wool',
    category: 'Polo Shirts',
    subCategory: 'Luxury',
    price: 2800,
    rating: 4.9,
    numReviews: 2,
    isNewArrival: false,
    isLuxury: true,
    luxuryTier: 'Platinum',
    variants: [
      { size: 'S', color: 'Charcoal', stock: 3 },
      { size: 'M', color: 'Charcoal', stock: 8 }
    ]
  },
  {
    name: 'Egyptian Cotton Royal Polo',
    slug: 'egyptian-cotton-royal-polo',
    images: ['/images/mustard.png'],
    fabricDescription: 'Giza 45 Egyptian Cotton',
    category: 'Polo Shirts',
    subCategory: 'Luxury',
    price: 2100,
    rating: 4.8,
    numReviews: 10,
    isNewArrival: false,
    isLuxury: true,
    luxuryTier: 'Gold',
    variants: [
      { size: 'M', color: 'Champagne Gold', stock: 15 },
      { size: 'L', color: 'Champagne Gold', stock: 10 }
    ]
  },
  {
    name: 'Silk-Linen Heritage Polo',
    slug: 'silk-linen-heritage-polo',
    images: ['/images/navy.png'],
    fabricDescription: 'Mulberry Silk & Irish Linen',
    category: 'Polo Shirts',
    subCategory: 'Luxury',
    price: 2600,
    rating: 5.0,
    numReviews: 7,
    isNewArrival: true,
    isLuxury: true,
    luxuryTier: 'Platinum',
    limitedEdition: 100,
    limitedEditionStock: 25,
    variants: [
      { size: 'L', color: 'Deep Sapphire', stock: 15 },
      { size: 'XL', color: 'Deep Sapphire', stock: 10 }
    ]
  }
];

module.exports = products;
