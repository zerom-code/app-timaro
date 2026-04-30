
import React, { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { toast } from '@/components/ui/use-toast';
import { useAuth } from '@/hooks/useAuth';

interface AdminAuthGuardProps {
  children: React.ReactNode;
}

const AdminAuthGuard: React.FC<AdminAuthGuardProps> = ({ children }) => {
  const { user, isAdmin, loading } = useAuth();
  const location = useLocation();
  
  useEffect(() => {
    if (!loading && (!user || !isAdmin)) {
      toast({
        title: "Доступ обмежено",
        description: "Ви повинні бути адміністратором для доступу до цієї панелі",
        variant: "destructive",
      });
    }
  }, [user, isAdmin, loading]);

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Завантаження...</div>;
  }

  if (!user || !isAdmin) {
    return <Navigate to="/admin/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};

export default AdminAuthGuard;
