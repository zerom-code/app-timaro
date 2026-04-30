
import * as React from "react";
import { useState, useEffect, useRef } from "react";
import { BrowserRouter, Routes, Route, useNavigate } from "react-router-dom";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { CartProvider } from "@/hooks/useCart";
import AdminAuthGuard from "@/components/auth/AdminAuthGuard";
import VersionGuard from "@/components/VersionGuard";

// Pages
import Index from "./pages/Index";
import MenuPage from "./pages/MenuPage";
import ProductDetailPage from "./pages/ProductDetailPage";
import CartPage from "./pages/CartPage";
import OrderSuccessPage from "./pages/OrderSuccessPage";
import AboutPage from "./pages/AboutPage";
import ContactsPage from "./pages/ContactsPage";
import LoginPage from "./pages/auth/LoginPage";
import RegisterPage from "./pages/auth/RegisterPage";
import ForgotPasswordPage from "./pages/auth/ForgotPasswordPage";
import UserProfilePage from "./pages/user/UserProfilePage";
import OrderHistoryPage from "./pages/user/OrderHistoryPage";
import AdminProductsPage from "./pages/admin/AdminProductsPage";
import AdminPanelPage from "./pages/admin/AdminPanelPage";
import AdminOrdersPage from "./pages/admin/AdminOrdersPage";
import AdminLoginPage from "./pages/admin/AdminLoginPage";
import NotFound from "./pages/NotFound";
import TermsPage from "./pages/TermsPage";
import DeliveryPage from "./pages/DeliveryPage";
import SettingsPage from "./pages/SettingsPage";
import PromotionsPage from "./pages/PromotionsPage";
import LockScreenPage from "./pages/LockScreenPage";
import DebugPage from "./pages/DebugPage";
import InvitePage from "./pages/InvitePage";
import PrivacyPage from "./pages/PrivacyPage";
import { App as CapApp } from '@capacitor/app';
import { deepLinkRouter } from './services/deepLinkRouter';
import { securityManager } from "./services/biometricManager";



const NavigationManager: React.FC = () => {
  const navigate = useNavigate();
  const [isLocked, setIsLocked] = useState(true);
  const lastActiveTime = useRef<number>(Date.now());
  const pendingUrl = useRef<string | null>(null);

  useEffect(() => {
    deepLinkRouter.init((path) => {
      if (isLocked) {
        pendingUrl.current = path;
      } else {
        navigate(path);
      }
    });
    
    CapApp.addListener('appUrlOpen', (event) => {
      console.log("DEEP LINK Received:", event.url);
      deepLinkRouter.handle(event.url);
    });

    CapApp.addListener('appStateChange', (state) => {
      if (state.isActive) {
        const now = Date.now();
        const elapsedSeconds = (now - lastActiveTime.current) / 1000;
        const timeout = securityManager.getLockTimeout();

        console.log(`App became active. Elapsed: ${elapsedSeconds}s, Timeout: ${timeout}s`);

        if (elapsedSeconds > timeout && securityManager.hasPin()) {
          setIsLocked(true);
        }
      } else {
        lastActiveTime.current = Date.now();
        console.log("App went to background at:", lastActiveTime.current);
      }
    });

    CapApp.getLaunchUrl().then((launchUrl) => {
      if (launchUrl?.url) {
        deepLinkRouter.handle(launchUrl.url);
      }
    });

    return () => {
      CapApp.removeAllListeners();
    };
  }, [navigate, isLocked]);

  const handleUnlock = () => {
    setIsLocked(false);
    if (pendingUrl.current) {
      setTimeout(() => {
        navigate(pendingUrl.current!);
        pendingUrl.current = null;
      }, 100);
    }
  };

  if (isLocked) {
    return <LockScreenPage onUnlock={handleUnlock} />;
  }

  return (
    <Routes>
      <Route path="/" element={<Index />} />
      <Route path="/menu" element={<MenuPage />} />
      <Route path="/product/:id" element={<ProductDetailPage />} />
      <Route path="/cart" element={<CartPage />} />
      <Route path="/order-success" element={<OrderSuccessPage />} />
      <Route path="/about" element={<AboutPage />} />
      <Route path="/contacts" element={<ContactsPage />} />
      <Route path="/terms" element={<TermsPage />} />
      <Route path="/privacy" element={<PrivacyPage />} />
      <Route path="/delivery" element={<DeliveryPage />} />
      <Route path="/settings" element={<SettingsPage />} />
      <Route path="/promotions" element={<PromotionsPage />} />
      <Route path="/debug" element={<DebugPage />} />
      <Route path="/invite/:token" element={<InvitePage />} />
      <Route path="/auth/login" element={<LoginPage />} />
      <Route path="/auth/register" element={<RegisterPage />} />
      <Route path="/auth/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/profile" element={<UserProfilePage />} />
      <Route path="/order-history" element={<OrderHistoryPage />} />
      <Route path="/admin/login" element={<AdminLoginPage />} />
      <Route path="/adminpanel" element={<AdminAuthGuard><AdminPanelPage /></AdminAuthGuard>} />
      <Route path="/admin/products" element={<AdminAuthGuard><AdminProductsPage /></AdminAuthGuard>} />
      <Route path="/admin/orders" element={<AdminAuthGuard><AdminOrdersPage /></AdminAuthGuard>} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

const App: React.FC = () => (
    <TooltipProvider>
      <CartProvider>
        <VersionGuard>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <NavigationManager />
          </BrowserRouter>
        </VersionGuard>
      </CartProvider>
    </TooltipProvider>
);

export default App;
