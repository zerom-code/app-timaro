
import * as React from 'react';
import MainLayout from '@/components/layouts/MainLayout';
import Hero from '@/components/ui/Hero';
import ProductCard from '@/components/ui/ProductCard';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { dataRepository } from '@/services/dataRepository';
import { Product } from '@/models/Product';

const Index = () => {
  const [featuredProducts, setFeaturedProducts] = React.useState<Product[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const loadFeatured = async () => {
      try {
        const products = await dataRepository.getAllProducts();
        setFeaturedProducts(products.slice(0, 4));
      } catch (error) {
        console.error("Error loading featured products:", error);
      } finally {
        setLoading(false);
      }
    };
    loadFeatured();
  }, []);

  return (
    <MainLayout>
      <Hero />

      {/* Featured Products */}
      <section className="py-8 bg-white">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-text">Популярне</h2>
            <Link to="/menu" className="text-primary text-sm font-bold">
              Дивитися все
            </Link>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {featuredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
          
          <div className="mt-8">
            <Link to="/promotions">
              <div className="w-full h-24 bg-orange-100 rounded-xl flex items-center justify-between px-6 border border-orange-200">
                <div>
                  <h3 className="font-bold text-orange-800">Акції тижня</h3>
                  <p className="text-xs text-orange-600">Знижки до -30%</p>
                </div>
                <Button className="bg-orange-500 hover:bg-orange-600 text-white size-sm">
                  Переглянути
                </Button>
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* App Info Footer (Simplified) */}
      <section className="py-12 bg-gray-50 border-t">
        <div className="container mx-auto px-4 text-center">
          <p className="text-xs text-text-light">
            Shawarma TiMaRo App • Смачно, швидко, надійно.<br/>
            Працюємо для вас щодня з 10:00 до 22:00.
          </p>
        </div>
      </section>
    </MainLayout>
  );
};

export default Index;
