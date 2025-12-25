// Sample product data for local development/testing
const now = new Date();

const sampleProducts = Array.from({ length: 20 }).map((_, i) => {
  const id = `sample-${i + 1}`;
  const name = [
    'Fresh Red Apples', 'Organic Bananas', 'Local Honey', 'Free-range Eggs', 'Brown Rice',
    'Raw Milk', 'Green Spinach', 'Sweet Potatoes', 'Cottage Cheese', 'Ginger Root',
    'Turmeric Powder', 'Jaggery Blocks', 'Tomato Basket', 'Onion Sack', 'Garlic Bulbs',
    'Mango (Seasonal)', 'Lentils (Masoor)', 'Chili Powder', 'Coriander Leaves', 'Paneer'
  ][i];

  return {
    _id: id,
    name,
    category: i % 3 === 0 ? 'Vegetables' : i % 3 === 1 ? 'Fruits' : 'Dairy',
    price: Math.floor(40 + Math.random() * 400),
    unit: 'UNIT',
    quantity: Math.floor(5 + Math.random() * 95),
    location: ['Delhi', 'Mumbai', 'Bangalore', 'Pune', 'Hyderabad'][i % 5],
    images: [`/logo/logo.png`],
    views: Math.floor(50 + Math.random() * 10000),
    clicks: `${Math.floor(30 + Math.random() * 100)}%`,
    rating: +(Math.random() * 5).toFixed(1),
    reviews: Math.floor(Math.random() * 300),
    sellerName: `seller-${i + 1}`,
    createdAt: new Date(now.getTime() - i * 86400000).toISOString(),
  };
});

export default sampleProducts;
