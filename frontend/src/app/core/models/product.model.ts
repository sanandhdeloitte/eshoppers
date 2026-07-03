export interface Review {
  id?: number | string;
  reviewerName: string;
  rating: number;
  comment: string;
  createdAt?: string;
}

export interface Product {
  id: number;
  name: string;
  title?: string;
  description: string;
  stock: number | string;
  price: number;
  category: string;
  thumbnail: string;
  image?: string;
  rating?: number;
  brand?: string;
  reviews?: Review[];
  numReviews?: number;
}

export interface ProductsResponse {
  success: boolean;
  message: string;
  products: Product[];
  total: number;
  page: number;
  pageSize: number;
}

export interface ProductResponse {
  success: boolean;
  message: string;
  product: Product;
}

export interface CategoriesResponse {
  success: boolean;
  message: string;
  categories: string[];
}
