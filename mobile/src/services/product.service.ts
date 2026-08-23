import api from './api';

export interface Product {
  _id: string;
  name: string;
  slug: string;
  price: number;
  originalPrice?: number;
  fabricDescription?: string;
  category: string;
  isSale?: boolean;
  isNewArrival?: boolean;
  images: string[];
  variants?: any[];
  description?: string;
  stock?: number;
}

export const getProducts = async (params = {}) => {
  const { data } = await api.get('/products', { params });
  return data;
};

export const getProductBySlug = async (slug: string) => {
  const { data } = await api.get(`/products/${slug}`);
  return data;
};
