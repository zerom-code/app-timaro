
import * as React from 'react';
import MainLayout from '@/components/layouts/MainLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield, Info, ChevronRight, Phone, KeyRound } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { securityManager, BiometricType } from '@/services/biometricManager';
import { toast } from 'sonner';
import { Link } from 'react-router-dom';
import { APP_VERSION } from '@/constants/version';

const SettingsPage: React.FC = () => {
  const [bioEnabled, setBioEnabled] = React.useState(securityManager.isBiometricsEnabled());
  const [bioInfo, setBioInfo] = React.useState<{available: boolean, type: BiometricType}>({available: true, type: 'Fingerprint'});

  const handleBioToggle = (checked: boolean) => {
    securityManager.setBiometricsEnabled(checked);
    setBioEnabled(checked);
    toast.success(checked ? "Біометрія увімкнена" : "Біометрія вимкнена");
  };

  const handleChangePin = () => {
    // Для зміни ПІНу ми просто очищуємо старий і перезавантажуємо сторінку
    // App.tsx побачить, що ПІНу немає, і знову покаже екран створення
    if (confirm("Ви впевнені, що хочете змінити ПІН-код? Додаток буде заблоковано для встановлення нового коду.")) {
      localStorage.removeItem('shawarma_pin_code');
      window.location.reload(); // Перезавантажуємо, щоб спрацював захист в App.tsx
    }
  };

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <h1 className="text-3xl font-bold mb-8">Налаштування</h1>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center text-lg">
                <Shield className="w-5 h-5 mr-2 text-primary" />
                Безпека та доступ
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Біометрія */}
              <div className="flex items-center justify-between py-2 border-b">
                <div className="space-y-0.5">
                  <Label htmlFor="bio-auth">Біометрична автентифікація</Label>
                  <p className="text-xs text-text-light">Використовувати {bioInfo.type} для входу</p>
                </div>
                <Switch 
                  id="bio-auth" 
                  checked={bioEnabled}
                  onCheckedChange={handleBioToggle}
                  disabled={!bioInfo.available}
                />
              </div>

              <div className="flex items-center justify-between py-2">
                <div className="flex items-center">
                  <KeyRound className="w-4 h-4 mr-2 text-gray-400" />
                  <span className="text-text">PIN-код додатка</span>
                </div>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={handleChangePin}
                  className="text-primary border-primary hover:bg-primary/5"
                >
                  Змінити
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center text-lg">
                <Info className="w-5 h-5 mr-2 text-primary" />
                Інформація
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <Link to="/about" className="flex items-center justify-between p-4 border-b hover:bg-gray-50 transition-colors">
                <span className="text-text">Про нас</span>
                <ChevronRight className="w-4 h-4 text-gray-400" />
              </Link>
              <Link to="/delivery" className="flex items-center justify-between p-4 border-b hover:bg-gray-50 transition-colors">
                <span className="text-text">Доставка та оплата</span>
                <ChevronRight className="w-4 h-4 text-gray-400" />
              </Link>
              <Link to="/privacy" className="flex items-center justify-between p-4 border-b hover:bg-gray-50 transition-colors">
                <span className="text-text">Політика конфіденційності</span>
                <ChevronRight className="w-4 h-4 text-gray-400" />
              </Link>
              <Link to="/terms" className="flex items-center justify-between p-4 border-b hover:bg-gray-50 transition-colors">
                <span className="text-text">Умови використання</span>
                <ChevronRight className="w-4 h-4 text-gray-400" />
              </Link>
              <div className="p-4 bg-gray-50">
                <h4 className="text-sm font-bold mb-2 flex items-center">
                  <Phone className="w-3 h-3 mr-2" /> Контакти
                </h4>
                <p className="text-xs text-text-light">+380 (99) 123-45-67</p>
                <p className="text-xs text-text-light">м. Київ, вул. Хрещатик, 22</p>
              </div>
            </CardContent>
          </Card>
        </div>
        
        <div className="mt-8 text-center pb-12">
          <p className="text-[10px] text-text-light uppercase tracking-widest font-bold">Shawarma TiMaRo</p>
          <p className="text-[10px] text-text-light">Версія {APP_VERSION}</p>
        </div>
      </div>
    </MainLayout>
  );
};

export default SettingsPage;
