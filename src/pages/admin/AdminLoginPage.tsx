
import React, { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from '@/components/ui/use-toast';
import { useAuth } from '@/hooks/useAuth';

const AdminLoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { login, isAdmin, user, loading } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      await login(email, password);
      // Wait for profile to load and check admin status is handled by effect or manual check
      toast({
        title: "Перевірка прав...",
        description: "Виконується вхід до системи",
      });
    } catch (error: any) {
      toast({
        title: "Помилка!",
        description: "Невірні дані або помилка сервера",
        variant: "destructive",
      });
      setIsSubmitting(false);
    }
  };

  if (!loading && user && isAdmin) {
    return <Navigate to="/adminpanel" replace />;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="max-w-md w-full p-8 bg-white rounded-lg shadow-md">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold">Вхід до адмін панелі</h1>
          <p className="text-gray-600 mt-2">
            Введіть пароль для доступу до адміністративної панелі
          </p>
        </div>
        
        <form onSubmit={handleLogin} className="space-y-6">
          <div className="space-y-2">
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Email адміністратора
            </label>
            <Input
              id="email"
              type="email"
              placeholder="admin@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full"
              required
            />
          </div>
          
          <div className="space-y-2">
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
              Пароль
            </label>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full"
              required
            />
          </div>
          
          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? 'Перевірка...' : 'Увійти'}
          </Button>
          
          <div className="text-center mt-4">
            <a href="/" className="text-sm text-primary hover:underline">
              Повернутися на головну
            </a>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdminLoginPage;
