
import React, { useEffect, useState } from 'react';
import MainLayout from '@/components/layouts/MainLayout';
import { socketManager } from '@/services/socketManager';
import { Card, CardContent } from '@/components/ui/card';
import { Tag, Zap, Gift, Info } from 'lucide-react';
import { toast } from 'sonner';

interface Promo {
  id: number;
  message: string;
  isNew?: boolean;
}

const PromotionsPage: React.FC = () => {
  const [promos, setPromos] = useState<Promo[]>([
    { id: 1, message: "Знижка 10% на перше замовлення через додаток!" },
    { id: 2, message: "При покупці 3-х класичних шаурм - напій у подарунок!" }
  ]);

  useEffect(() => {
    // Підключаємось до сокету при відкритті екрану
    socketManager.connect();

    // Підписка на події від сервера
    const unsubscribe = socketManager.onMessage((data) => {
      if (data.type === 'PROMO_ALERT') {
        const newPromo: Promo = { id: data.id, message: data.message, isNew: true };
        setPromos(prev => [newPromo, ...prev]);
        
        toast.success("Нова акція!", {
          description: data.message
        });
      }
    });

    return () => {
      // Cleanup subscription
      unsubscribe();
      // socketManager.disconnect(); // Можна не дисконектити, якщо сокет один на весь додаток
    };
  }, []);

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center space-x-3 mb-8">
          <Tag className="w-8 h-8 text-primary" />
          <h1 className="text-3xl font-bold">Акції та бонуси</h1>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {promos.map((promo) => (
            <Card key={promo.id} className={`${promo.isNew ? 'border-primary bg-primary/5 animate-pulse' : ''}`}>
              <CardContent className="p-6 flex items-start space-x-4">
                <div className="bg-secondary/20 p-3 rounded-full">
                  {promo.id % 2 === 0 ? <Zap className="text-secondary-dark" /> : <Gift className="text-primary" />}
                </div>
                <div>
                  {promo.isNew && <span className="text-[10px] font-bold uppercase text-primary mb-1 block">Нова акція</span>}
                  <p className="text-lg font-medium">{promo.message}</p>
                  <p className="text-sm text-text-light mt-2 italic">Акція діє до кінця тижня</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-12 bg-blue-50 border border-blue-100 p-6 rounded-xl flex items-start">
          <Info className="text-blue-500 mr-3 flex-shrink-0" />
          <p className="text-sm text-blue-700">
            <strong>Real-time статус:</strong> Цей екран підключений до WebSocket. Нові акції з'являтимуться тут автоматично без перезавантаження сторінки.
          </p>
        </div>
      </div>
    </MainLayout>
  );
};

export default PromotionsPage;
