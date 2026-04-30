
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Fingerprint, Delete, Lock, ShieldCheck } from 'lucide-react';
import { securityManager } from '@/services/biometricManager';
import { toast } from 'sonner';

interface LockScreenProps {
  onUnlock: () => void;
}

const LockScreenPage: React.FC<LockScreenProps> = ({ onUnlock }) => {
  const [pin, setPin] = useState('');
  const navigate = useNavigate();
  const isSetupMode = !securityManager.hasPin();

  const handleNumberClick = (num: string) => {
    if (pin.length < 4) {
      const newPin = pin + num;
      setPin(newPin);
      if (newPin.length === 4) {
        if (isSetupMode) {
          securityManager.setPin(newPin);
          toast.success("PIN-код встановлено!");
          onUnlock();
        } else if (securityManager.verifyPin(newPin)) {
          toast.success("Доступ дозволено");
          onUnlock();
        } else {
          toast.error("Неправильний код");
          setPin('');
        }
      }
    }
  };

  const handleBiometrics = async () => {
    if (isSetupMode) {
      toast.error("Спочатку встановіть PIN-код");
      return;
    }

    if (!securityManager.isBiometricsEnabled()) {
      toast.info("Біометрія не активована");
      return;
    }

    // Invoke authentication dialog
    const success = await securityManager.authenticate();
    if (success) {
      toast.success("Біометрія успішна");
      onUnlock();
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6 fixed inset-0 z-[9999]">
      <div className="mb-8 text-center">
        <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
          {isSetupMode ? <ShieldCheck className="w-8 h-8 text-primary" /> : <Lock className="w-8 h-8 text-primary" />}
        </div>
        <h2 className="text-xl font-bold text-gray-800">
          {isSetupMode ? 'Створіть свій PIN-код' : 'Введіть PIN-код'}
        </h2>
        <p className="text-sm text-gray-500 mt-1">
          {isSetupMode ? 'Встановіть 4 цифри для захисту' : 'Для доступу до Shawarma TiMaRo'}
        </p>
      </div>

      <div className="flex space-x-4 mb-12">
        {[1, 2, 3, 4].map((i) => (
          <div 
            key={i}
            className={`w-4 h-4 rounded-full border-2 border-primary transition-all duration-200 ${
              pin.length >= i ? 'bg-primary scale-110' : 'bg-transparent'
            }`}
          />
        ))}
      </div>

      <div className="grid grid-cols-3 gap-6 max-w-xs w-full">
        {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((num) => (
          <button
            key={num}
            onClick={() => handleNumberClick(num)}
            className="w-16 h-16 rounded-full border border-gray-200 text-2xl font-semibold active:bg-primary active:text-white flex items-center justify-center mx-auto"
          >
            {num}
          </button>
        ))}
        <button onClick={handleBiometrics} className="w-16 h-16 rounded-full flex items-center justify-center mx-auto text-primary">
          {!isSetupMode && <Fingerprint className="w-8 h-8" />}
        </button>
        <button onClick={() => handleNumberClick('0')} className="w-16 h-16 rounded-full border border-gray-200 text-2xl font-semibold active:bg-primary active:text-white flex items-center justify-center mx-auto">
          0
        </button>
        <button onClick={() => setPin(pin.slice(0, -1))} className="w-16 h-16 rounded-full flex items-center justify-center mx-auto text-gray-400">
          <Delete className="w-8 h-8" />
        </button>
      </div>
    </div>
  );
};

export default LockScreenPage;
