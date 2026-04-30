class LocalRepository {
  private STORAGE_KEYS = {
    PRODUCTS: 'shawarma_products_cache',
    USER: 'shawarma_user_profile',
    ORDERS: 'shawarma_orders_history'
  };


  saveProducts(products: any[]): void {
    localStorage.setItem(this.STORAGE_KEYS.PRODUCTS, JSON.stringify(products));
  }

  getProducts(): any[] {
    const data = localStorage.getItem(this.STORAGE_KEYS.PRODUCTS);
    return data ? JSON.parse(data) : [];
  }

  getProductById(id: number): any | undefined {
    const products = this.getProducts();
    return products.find((p: any) => p.id === id);
  }

  deleteProductById(id: number): void {
    const products = this.getProducts();
    const updated = products.filter((p: any) => p.id !== id);
    localStorage.setItem(this.STORAGE_KEYS.PRODUCTS, JSON.stringify(updated));
  }

  deleteProducts(): void {
    localStorage.removeItem(this.STORAGE_KEYS.PRODUCTS);
  }

  saveUser(user: any): void {
    localStorage.setItem(this.STORAGE_KEYS.USER, JSON.stringify(user));
  }

  getUser(): any | null {
    const data = localStorage.getItem(this.STORAGE_KEYS.USER);
    return data ? JSON.parse(data) : null;
  }

  deleteUser(): void {
    localStorage.removeItem(this.STORAGE_KEYS.USER);
  }

  saveOrders(orders: any[]): void {
    localStorage.setItem(this.STORAGE_KEYS.ORDERS, JSON.stringify(orders));
  }

  getOrders(): any[] {
    const data = localStorage.getItem(this.STORAGE_KEYS.ORDERS);
    return data ? JSON.parse(data) : [];
  }

  deleteOrderById(id: string): void {
    const orders = this.getOrders();
    const updated = orders.filter((o: any) => o.id !== id);
    localStorage.setItem(this.STORAGE_KEYS.ORDERS, JSON.stringify(updated));
  }
}

export const localRepository = new LocalRepository();
