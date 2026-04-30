
import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import MainLayout from '@/components/layouts/MainLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { UserPlus, Check, X } from 'lucide-react';
import { toast } from 'sonner';

const InvitePage: React.FC = () => {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();

  const handleAccept = () => {
    toast.success("Запрошення прийнято!", {
      description: `Ви використали код: ${token}`
    });
    navigate('/menu');
  };

  const handleDecline = () => {
    toast.info("Запрошення відхилено");
    navigate('/');
  };

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-20 flex justify-center">
        <Card className="max-w-md w-full overflow-hidden border-none shadow-2xl">
          <div className="bg-primary p-8 text-center text-white">
            <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4 backdrop-blur-md">
              <UserPlus className="w-10 h-10" />
            </div>
            <h1 className="text-2xl font-bold">Вас запрошено!</h1>
            <p className="text-white/80 mt-2">Приєднуйтесь до нашої реферальної програми</p>
          </div>
          <CardContent className="p-8 text-center">
            <div className="mb-8">
              <p className="text-text-light mb-4">Ви отримали запрошення з кодом:</p>
              <div className="bg-gray-100 p-3 rounded-lg font-mono font-bold text-primary">
                {token}
              </div>
              <p className="text-sm text-text-light mt-6">
                Після прийняття ви отримаєте 50 бонусних балів на наступну шаурму!
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Button variant="outline" onClick={handleDecline} className="flex items-center justify-center">
                <X className="w-4 h-4 mr-2" />
                Відхилити
              </Button>
              <Button onClick={handleAccept} className="bg-primary hover:bg-primary-dark flex items-center justify-center">
                <Check className="w-4 h-4 mr-2" />
                Прийняти
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
};

export default InvitePage;
