
import * as React from 'react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

const Hero: React.FC = () => {
  return (
    <div className="relative bg-gradient-to-r from-primary to-primary-light text-white py-10">
      <div className="container mx-auto px-4">
        <div className="flex flex-col items-center text-center">
          <h1 className="text-3xl font-bold mb-2">
            Смак сходу у вашому смартфоні
          </h1>
          <p className="text-sm mb-6 opacity-90 max-w-xs">
            Свіжа шаурма з доставкою від 30 хвилин. Спробуйте найкраще!
          </p>
          <Link to="/menu">
            <Button className="bg-white text-primary hover:bg-gray-100 font-bold px-8 h-12 rounded-full shadow-lg">
              ПЕРЕЙТИ ДО МЕНЮ
            </Button>
          </Link>
        </div>
      </div>
      
      {/* Decorative dots for app feel */}
      <div className="absolute top-2 right-4 w-2 h-2 bg-secondary rounded-full opacity-50"></div>
      <div className="absolute bottom-4 left-6 w-3 h-3 bg-secondary rounded-full opacity-30"></div>
    </div>
  );
};

export default Hero;
