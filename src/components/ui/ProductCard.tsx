
import * as React from 'react';
import { Button } from '@/components/ui/button';
import { useCart } from '@/hooks/useCart';
import { ShoppingCart, Plus, Minus } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Product } from '@/models/Product';


interface ProductCardProps {
  product: Product;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { addToCart, removeFromCart, getItemQuantity } = useCart();
  const quantity = getItemQuantity(product.id);

  const handleAddToCart = () => {
    addToCart(product);
  };

  const handleRemoveFromCart = () => {
    removeFromCart(product.id);
  };

  return (
      <div className="product-card self-start flex flex-col h-auto">
        <Link to={`/product/${product.id}`} className="relative w-full aspect-w-1 aspect-h-1 block cursor-pointer">
          <img
              src={product.imageUrl}
              alt={product.name}
              className="object-contain w-full h-full hover:scale-105 transition-transform duration-300"
          />
          <div className="absolute top-2 right-2 bg-secondary text-secondary-foreground px-2 py-1 rounded text-sm font-medium">
            {product.category}
          </div>
        </Link>
        <div className="p-4 flex-grow flex flex-col">
          <Link to={`/product/${product.id}`}>
            <h3 className="font-heading font-bold text-lg mb-2 hover:text-primary transition-colors">{product.name}</h3>
          </Link>
          <p className="text-text-light text-sm mb-4 flex-grow">{product.description}</p>
          <div className="flex items-center justify-between">
            <p className="text-primary font-bold text-lg">{product.price} ₴</p>
            {quantity === 0 ? (
                <Button
                    className="bg-primary hover:bg-primary-light flex items-center justify-center"
                    onClick={handleAddToCart}
                >
                  <ShoppingCart className="w-4 h-4 mr-1 text-white" />
                  <span className="text-white">У кошик</span>
                </Button>
            ) : (
                <div className="flex items-center space-x-2">
                  <Button
                      className="h-8 w-8 bg-white border border-gray-200 flex items-center justify-center p-0"
                      onClick={handleRemoveFromCart}
                  >
                    <Minus className="h-4 w-4 text-black" />
                  </Button>
                  <span className="font-medium text-black">{quantity}</span>
                  <Button
                      className="h-8 w-8 bg-primary hover:bg-primary-dark flex items-center justify-center p-0"
                      onClick={handleAddToCart}
                  >
                    <Plus className="h-4 w-4 text-white" />
                  </Button>
                </div>
            )}
          </div>
        </div>
      </div>
  );
};

export default ProductCard;
