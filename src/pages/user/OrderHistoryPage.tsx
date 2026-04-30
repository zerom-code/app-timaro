
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import MainLayout from '@/components/layouts/MainLayout';
import { getUserOrders } from '@/services/firebaseOrderService';
import { OrderStatus, getStatusColor, getStatusLabel } from '@/models/Order';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { Loader2, LogIn } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

const OrderHistoryPage: React.FC = () => {
    const { user, loading } = useAuth();

    const { data: orders, isLoading, error } = useQuery({
        queryKey: ['orders', user?.uid],
        queryFn: async () => {
            const guestOrderIds = JSON.parse(localStorage.getItem('shawarma_guest_order_ids') || '[]');
            const result = await getUserOrders(user?.uid || null, guestOrderIds);
            
            if (user && result.length > 0 && guestOrderIds.length > 0) {
                localStorage.removeItem('shawarma_guest_order_ids');
            }
            return result;
        },
    });

    if (loading) {
        return (
            <MainLayout>
                <div className="flex justify-center items-center min-h-[60vh]">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
            </MainLayout>
        );
    }

    return (
        <MainLayout>
            <div className="container mx-auto px-4 py-8 md:py-12">
                <div className="max-w-5xl mx-auto">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                        <h1 className="text-2xl md:text-3xl font-bold">Історія замовлень</h1>

                        <div className="flex flex-wrap gap-2 sm:gap-4">
                            <Link to="/profile" className="flex-1 sm:flex-none">
                                <Button variant="outline" className="w-full sm:w-auto">
                                    Профіль
                                </Button>
                            </Link>
                            <Link to="/menu" className="flex-1 sm:flex-none">
                                <Button className="bg-primary hover:bg-primary-dark w-full sm:w-auto">
                                    Нове замовлення
                                </Button>
                            </Link>
                        </div>
                    </div>

                    {!user && orders && orders.length > 0 && (
                        <div className="mb-6 p-4 bg-orange-50 border border-orange-200 rounded-xl flex flex-col md:flex-row items-center justify-between gap-4">
                            <div className="text-center md:text-left">
                                <p className="font-bold text-orange-800">Ви переглядаєте гостьову історію</p>
                                <p className="text-sm text-orange-700">Зареєструйтеся, щоб ваші замовлення збереглися назавжди та були доступні на будь-якому пристрої.</p>
                            </div>
                            <Link to="/auth/register">
                                <Button className="bg-orange-600 hover:bg-orange-700 whitespace-nowrap">
                                    Зареєструватися
                                </Button>
                            </Link>
                        </div>
                    )}

                    {isLoading ? (
                        <div className="flex justify-center py-12">
                            <Loader2 className="h-8 w-8 animate-spin text-primary" />
                        </div>
                    ) : error ? (
                        <div className="bg-red-50 border border-red-200 rounded-md p-6 text-center">
                            <p className="text-red-600">Виникла помилка при завантаженні замовлень.</p>
                            <Button variant="outline" className="mt-4" onClick={() => window.location.reload()}>
                                Спробувати знову
                            </Button>
                        </div>
                    ) : orders && orders.length > 0 ? (
                        <div className="space-y-6">
                            {orders.map(order => (
                                <div key={order.id} className="bg-white rounded-lg shadow-md overflow-hidden">
                                    <div className="p-4 md:p-6">
                                        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4">
                                            <div>
                                                <h3 className="text-lg font-medium">Замовлення №{order.id}</h3>
                                                <p className="text-text-muted text-sm">
                                                    {order.createdAt ? format(new Date(order.createdAt), 'dd.MM.yyyy, HH:mm') : 'Дата невідома'}
                                                </p>
                                            </div>
                                            <div className={`inline-block px-3 py-1 rounded-full text-sm font-medium mt-2 sm:mt-0 ${getStatusColor(order.status)}`}>
                                                {getStatusLabel(order.status)}
                                            </div>
                                        </div>

                                        <div className="border-t border-gray-200 pt-4">
                                            <div className="space-y-3">
                                                {order.items.map((item, index) => (
                                                    <div key={index} className="flex justify-between items-center text-sm md:text-base">
                                                        <div className="flex items-center">
                                                            <img
                                                                src={item.imageUrl}
                                                                alt={item.name}
                                                                className="w-10 h-10 md:w-12 md:h-12 object-cover rounded mr-3"
                                                            />
                                                            <span className="max-w-[150px] md:max-w-none truncate">{item.name} x{item.quantity}</span>
                                                        </div>
                                                        <span className="font-medium shrink-0">{item.price * item.quantity} ₴</span>
                                                    </div>
                                                ))}
                                            </div>

                                            <div className="flex justify-between items-center mt-4 pt-4 border-t border-gray-200">
                                                <span className="font-medium">Загальна сума:</span>
                                                <span className="text-lg font-bold">{order.total} ₴</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="bg-gray-50 px-4 md:px-6 py-3">
                                        <div className="text-xs md:text-sm text-text-muted">
                                            Спосіб оплати: <span className="font-medium">
                                            {order.paymentMethod === 'cash' 
                                              ? order.changeAmount 
                                                ? `Готівкою (решта з ${order.changeAmount} ₴)` 
                                                : 'Готівкою кур\'єру'
                                              : order.paymentMethod === 'card' 
                                                ? 'Карткою кур\'єру' 
                                                : 'Онлайн оплата'}
                                          </span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="bg-white rounded-lg shadow-md p-12 text-center">
                            <h3 className="text-lg font-medium mb-2">У вас ще немає замовлень</h3>
                            <p className="text-text-muted mb-6">Зробіть своє перше замовлення прямо зараз!</p>
                            <Link to="/menu">
                                <Button className="bg-primary hover:bg-primary-dark">
                                    Перейти до меню
                                </Button>
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </MainLayout>
    );
};

export default OrderHistoryPage;
