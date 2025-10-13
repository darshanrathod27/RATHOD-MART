import {
  products as allProducts,
  categories as allCategories,
  brands as allBrands,
  offerProducts as allOfferProducts,
} from "./products";

// This is a mock API to simulate fetching data from a server.
// In a real application, you would replace this with actual API calls.

const API_URL = process.env.REACT_APP_API_URL;

const simulateNetworkRequest = (data) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(data);
    }, 500); // Simulate a 500ms network delay
  });
};

export const fetchProducts = async () => {
  console.log(`Fetching products from ${API_URL}`);
  return simulateNetworkRequest(allProducts);
};

export const fetchProductById = async (id) => {
  console.log(`Fetching product by id from ${API_URL}`);
  const product =
    allProducts.find((p) => p.id === parseInt(id)) || allProducts[0];
  return simulateNetworkRequest(product);
};

export const fetchCategories = async () => {
  console.log(`Fetching categories from ${API_URL}`);
  return simulateNetworkRequest(allCategories);
};

export const fetchBrands = async () => {
  console.log(`Fetching brands from ${API_URL}`);
  return simulateNetworkRequest(allBrands);
};

export const fetchOfferProducts = async () => {
  console.log(`Fetching offer products from ${API_URL}`);
  return simulateNetworkRequest(allOfferProducts);
};
