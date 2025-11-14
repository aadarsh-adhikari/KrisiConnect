export const products = [
  {
    id: 1,
    name: "Fresh Tomatoes",
    price: 80,
    unit: "kg",
    image: "/products/tomatoes.jpg",
    farmer: "Ramesh Kumar",
    location: "Punjab",
    category: "Vegetables",
    description: "Fresh, organic tomatoes grown without pesticides",
    inStock: true,
    rating: 4.5,
    reviews: 24
  },
  {
    id: 2,
    name: "Basmati Rice",
    price: 120,
    unit: "kg",
    image: "/products/rice.jpg",
    farmer: "Suresh Patel",
    location: "Haryana",
    category: "Grains",
    description: "Premium quality basmati rice, aged for perfect aroma",
    inStock: true,
    rating: 4.8,
    reviews: 45
  },
  {
    id: 3,
    name: "Pure Honey",
    price: 350,
    unit: "kg",
    image: "/products/honey.jpg",
    farmer: "Maya Devi",
    location: "Himachal Pradesh",
    category: "Dairy & Honey",
    description: "100% natural honey collected from mountain flowers",
    inStock: true,
    rating: 4.7,
    reviews: 18
  },
  {
    id: 4,
    name: "Green Spinach",
    price: 40,
    unit: "kg",
    image: "/products/spinach.jpg",
    farmer: "Ajay Singh",
    location: "Uttar Pradesh",
    category: "Vegetables",
    description: "Fresh leafy spinach, rich in iron and vitamins",
    inStock: true,
    rating: 4.3,
    reviews: 12
  },
  {
    id: 5,
    name: "Farm Eggs",
    price: 6,
    unit: "piece",
    image: "/products/eggs.jpg",
    farmer: "Lakshmi Reddy",
    location: "Andhra Pradesh",
    category: "Dairy & Eggs",
    description: "Free-range chicken eggs from healthy hens",
    inStock: true,
    rating: 4.6,
    reviews: 33
  },
  {
    id: 6,
    name: "Fresh Milk",
    price: 55,
    unit: "liter",
    image: "/products/milk.jpg",
    farmer: "Gopal Sharma",
    location: "Rajasthan",
    category: "Dairy & Eggs",
    description: "Pure cow milk, delivered fresh daily",
    inStock: true,
    rating: 4.9,
    reviews: 67
  }
];

export const getProducts = () => {
  return products;
};

export const getFeaturedProducts = () => {
  return products; // Return all products instead of just first 3
};

export const getProductsByCategory = (category) => {
  return products.filter(product => product.category === category);
};