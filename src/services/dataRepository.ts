
import { getAllProducts as getFirebaseProducts, getProductById as getFirebaseProductById } from './firebaseProductService';
import { localRepository } from './localRepository';
import { Product } from '../models/Product';

class DataRepository {
  async getAllProducts(): Promise<Product[]> {
    try {
      const freshProducts = await getFirebaseProducts();
      
      if (freshProducts && freshProducts.length > 0) {
        console.log(`Repository: Fetched ${freshProducts.length} products from Firebase`);
        localRepository.saveProducts(freshProducts);
        console.log("Repository: Data updated from Firebase and saved locally");
        return freshProducts;
      }
      
      console.log("Repository: Firebase returned empty list, trying local cache");
      const cachedProducts = localRepository.getProducts();
      if (cachedProducts && cachedProducts.length > 0) {
        return cachedProducts;
      }
      
      return freshProducts;
    } catch (error) {
      console.error("Repository: Firebase error, returning local cache", error);
      const cached = localRepository.getProducts();
      if (cached && cached.length > 0) return cached;
      
      return getFirebaseProducts(); 
    }
  }

  async getProduct(id: number): Promise<Product | undefined> {
    try {
      const remote = await getFirebaseProductById(id);
      if (remote) return remote;
      return localRepository.getProductById(id) || undefined;
    } catch (error) {
      console.error("Repository: Error fetching product, trying local", error);
      return localRepository.getProductById(id) || undefined;
    }
  }
}

export const dataRepository = new DataRepository();
