export interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  category: string;
  isAvailable?: boolean;
  createdAt?: string | Date;
  syncStatus?: 'synced' | 'pending' | 'error';
}

export const createProduct = (
  id: number,
  name: string,
  description: string,
  price: number,
  imageUrl: string,
  category: string,
  isAvailable: boolean = true
): Product => ({
  id,
  name,
  description,
  price,
  imageUrl,
  category,
  isAvailable,
  createdAt: new Date()
});