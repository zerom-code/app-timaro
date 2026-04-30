
import * as React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import MainLayout from '@/components/layouts/MainLayout';
import { Button } from '@/components/ui/button';
import { dataRepository } from '@/services/dataRepository';
import { Product } from '@/models/Product';
import { useCart } from '@/hooks/useCart';
import { ArrowLeft, ShoppingCart, CheckCircle2, Loader2 } from 'lucide-react';

const ProductDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addToCart, getItemQuantity } = useCart();
  
  const [product, setProduct] = React.useState<Product | undefined>(undefined);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      const result = await dataRepository.getProduct(Number(id));
      setProduct(result);
      setLoading(false);
    };
    fetchProduct();
  }, [id]);

  const quantity = product ? getItemQuantity(product.id) : 0;

  if (loading) {
    return (
      <MainLayout>
        <div className="container mx-auto px-4 py-20 flex flex-col items-center">
          <Loader2 className="w-12 h-12 text-primary animate-spin mb-4" />
          <p className="text-text-light">Завантаження деталей страви...</p>
        </div>
      </MainLayout>
    );
  }
  if (!product) {
    return (
      <MainLayout>
        <div className="container mx-auto px-4 py-20 text-center">
          <h2 className="text-2xl font-bold mb-4">Товар не знайдено</h2>
          <Button onClick={() => navigate('/menu')}>Повернутися до меню</Button>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-8">
        <Button 
          className="mb-6 flex items-center bg-transparent text-text-light hover:text-primary border-none shadow-none"
          onClick={() => navigate(-1)}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Назад
        </Button>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 bg-white p-8 rounded-2xl shadow-sm">
          <div className="flex items-center justify-center bg-gray-50 rounded-xl p-8">
            <img 
              src={product.imageUrl} 
              alt={product.name} 
              className="max-w-full h-auto max-h-[400px] object-contain hover:scale-105 transition-transform duration-500"
            />
          </div>

          <div className="flex flex-col justify-center">
            <div className="inline-block px-3 py-1 bg-accent text-accent-foreground rounded-full text-sm font-medium mb-4 w-fit">
              {product.category}
            </div>
            <h1 className="text-4xl font-bold text-text mb-4">{product.name}</h1>
            <p className="text-xl text-primary font-bold mb-6">{product.price} ₴</p>
            
            <div className="space-y-4 mb-8">
              <h3 className="font-bold text-lg">Опис:</h3>
              <p className="text-text-light leading-relaxed">
                {product.description}
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t">
              <Button 
                className="bg-primary hover:bg-primary-dark flex-1 h-12"
                onClick={() => addToCart(product)}
              >
                <ShoppingCart className="w-5 h-5 mr-2" />
                {quantity > 0 ? `Додати ще (у кошику: ${quantity})` : 'Додати у кошик'}
              </Button>
              
              {quantity > 0 && (
                <div className="flex items-center justify-center px-4 py-2 bg-green-50 text-green-700 rounded-lg border border-green-100">
                  <CheckCircle2 className="w-5 h-5 mr-2" />
                  Вже у кошику
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Additional information */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 bg-white rounded-xl shadow-sm border border-gray-100">
            <h4 className="font-bold mb-2">Склад</h4>
            <p className="text-sm text-text-light">Тільки свіжі інгредієнти від перевірених постачальників.</p>
          </div>
          <div className="p-6 bg-white rounded-xl shadow-sm border border-gray-100">
            <h4 className="font-bold mb-2">Час приготування</h4>
            <p className="text-sm text-text-light">Ми готуємо вашу шаурму за 10-15 хвилин.</p>
          </div>
          <div className="p-6 bg-white rounded-xl shadow-sm border border-gray-100">
            <h4 className="font-bold mb-2">Доставка</h4>
            <p className="text-sm text-text-light">Безкоштовна доставка при замовленні від 500 грн.</p>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default ProductDetailPage;
