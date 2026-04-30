
import React, { useState } from 'react';
import AdminLayout from '@/components/layouts/AdminLayout';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getAllOrders, updateOrderStatus } from '@/services/firebaseOrderService';
import { Order, OrderStatus, getStatusColor, getStatusLabel } from '@/models/Order';
import { Button } from '@/components/ui/button';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Loader2, Truck, X } from 'lucide-react';
import { format } from 'date-fns';
import { useToast } from '@/components/ui/use-toast';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';

const AdminOrdersPage: React.FC = () => {
    const { toast } = useToast();
    const queryClient = useQueryClient();
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

    const { data: orders, isLoading } = useQuery({
        queryKey: ['admin-orders'],
        queryFn: getAllOrders,
    });

    const updateStatusMutation = useMutation({
        mutationFn: ({ orderId, status }: { orderId: string, status: OrderStatus }) => {
            return updateOrderStatus(orderId, status);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-orders'] });
            toast({
                title: "Статус замовлення оновлено",
                description: "Зміни успішно збережено.",
            });
        },
        onError: (error) => {
            toast({
                title: "Помилка!",
                description: "Не вдалося оновити статус замовлення.",
                variant: "destructive",
            });
        },
    });

    const handleStatusChange = (orderId: string, newStatus: OrderStatus) => {
        updateStatusMutation.mutate({ orderId, status: newStatus });
    };

    const viewOrderDetails = (order: Order) => {
        setSelectedOrder(order);
    };

    return (
        <AdminLayout>
            <div className="space-y-6">
                <div className="flex justify-between items-center">
                    <h1 className="text-2xl font-bold">Управління замовленнями</h1>
                </div>

                {isLoading ? (
                    <div className="flex justify-center py-12">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    </div>
                ) : orders && orders.length > 0 ? (
                    <div className="space-y-4">
                        {/* Desktop View */}
                        <div className="hidden md:block bg-white rounded-lg shadow overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>ID</TableHead>
                                        <TableHead>Дата</TableHead>
                                        <TableHead>Клієнт</TableHead>
                                        <TableHead>Сума</TableHead>
                                        <TableHead>Статус</TableHead>
                                        <TableHead>Дії</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {orders.map((order) => (
                                        <TableRow key={order.id}>
                                            <TableCell className="font-medium">{order.id}</TableCell>
                                            <TableCell>
                                                {format(new Date(order.createdAt), 'dd.MM.yyyy HH:mm')}
                                            </TableCell>
                                            <TableCell>{order.userName || order.userEmail || 'Гість'}</TableCell>
                                            <TableCell>{order.total} ₴</TableCell>
                                            <TableCell>
                                                <Select defaultValue={order.status} onValueChange={(value) => handleStatusChange(order.id, value as OrderStatus)}>
                                                    <SelectTrigger className={`w-[140px] ${getStatusColor(order.status)}`}>
                                                        <SelectValue placeholder={getStatusLabel(order.status)} />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value={OrderStatus.ACCEPTED}>Прийнято</SelectItem>
                                                        <SelectItem value={OrderStatus.PREPARING}>Готується</SelectItem>
                                                        <SelectItem value={OrderStatus.DELIVERING}>Доставляється</SelectItem>
                                                        <SelectItem value={OrderStatus.DELIVERED}>Доставлено</SelectItem>
                                                        <SelectItem value={OrderStatus.CANCELLED}>Скасовано</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </TableCell>
                                            <TableCell>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => viewOrderDetails(order)}
                                                >
                                                    Деталі
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>

                        {/* Mobile View */}
                        <div className="md:hidden space-y-3">
                            {orders.map((order) => (
                                <div key={order.id} className="bg-white p-4 rounded-lg shadow-sm border space-y-4">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <p className="font-bold text-sm">#{order.id}</p>
                                            <p className="text-xs text-text-muted">
                                                {format(new Date(order.createdAt), 'dd.MM.yyyy HH:mm')}
                                            </p>
                                        </div>
                                        <Select defaultValue={order.status} onValueChange={(value) => handleStatusChange(order.id, value as OrderStatus)}>
                                            <SelectTrigger className={`w-[130px] h-8 text-[10px] ${getStatusColor(order.status)}`}>
                                                <SelectValue placeholder={getStatusLabel(order.status)} />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value={OrderStatus.ACCEPTED}>Прийнято</SelectItem>
                                                <SelectItem value={OrderStatus.PREPARING}>Готується</SelectItem>
                                                <SelectItem value={OrderStatus.DELIVERING}>Доставляється</SelectItem>
                                                <SelectItem value={OrderStatus.DELIVERED}>Доставлено</SelectItem>
                                                <SelectItem value={OrderStatus.CANCELLED}>Скасовано</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    
                                    <div className="grid grid-cols-2 gap-2 text-sm">
                                        <div>
                                            <p className="text-xs text-text-muted">Клієнт</p>
                                            <p className="font-medium truncate">{order.userName || order.userEmail || 'Гість'}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-xs text-text-muted">Сума</p>
                                            <p className="font-bold text-primary">{order.total} ₴</p>
                                        </div>
                                    </div>

                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="w-full"
                                        onClick={() => viewOrderDetails(order)}
                                    >
                                        Переглянути деталі
                                    </Button>
                                </div>
                            ))}
                        </div>
                    </div>
                ) : (
                    <div className="bg-white rounded-lg shadow-md p-12 text-center">
                        <h3 className="text-lg font-medium">Немає замовлень</h3>
                        <p className="text-text-muted mt-2">Замовлення відображатимуться тут, коли клієнти зроблять покупки.</p>
                    </div>
                )}
            </div>

            {/* Order Details Dialog */}
            <Dialog open={!!selectedOrder} onOpenChange={(open) => !open && setSelectedOrder(null)}>
                <DialogContent className="w-[95vw] sm:max-w-2xl max-h-[90vh] overflow-y-auto p-4 sm:p-6">
                    <DialogHeader>
                        <DialogTitle className="text-lg sm:text-xl">Деталі замовлення #{selectedOrder?.id}</DialogTitle>
                        <DialogDescription className="text-xs sm:text-sm">
                            {selectedOrder && format(new Date(selectedOrder.createdAt), 'dd.MM.yyyy HH:mm')}
                        </DialogDescription>
                    </DialogHeader>

                    {selectedOrder && (
                        <div className="space-y-6 mt-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="bg-gray-50 p-3 rounded-lg">
                                    <h3 className="font-bold text-sm mb-2 border-b pb-1">Інформація про клієнта</h3>
                                    <div className="space-y-1 text-xs sm:text-sm">
                                        <p><span className="text-text-muted">Ім'я:</span> {selectedOrder.userName || 'Не вказано'}</p>
                                        <p><span className="text-text-muted">Email:</span> {selectedOrder.userEmail || 'Не вказано'}</p>
                                        <p><span className="text-text-muted">Адреса:</span> {selectedOrder.address || 'Не вказано'}</p>
                                    </div>
                                </div>

                                <div className="bg-gray-50 p-3 rounded-lg">
                                    <h3 className="font-bold text-sm mb-2 border-b pb-1">Деталі замовлення</h3>
                                    <div className="space-y-1 text-xs sm:text-sm">
                                        <div className="flex items-center justify-between sm:justify-start">
                                            <span className="text-text-muted">Статус:</span>
                                            <span className={`inline-block px-2 py-0.5 sm:ml-2 rounded-full text-[10px] sm:text-xs font-medium ${getStatusColor(selectedOrder.status)}`}>
                                                {getStatusLabel(selectedOrder.status)}
                                            </span>
                                        </div>
                                        <p className="flex justify-between sm:block">
                                            <span className="text-text-muted">Спосіб оплати:</span>{' '}
                                            <span>{selectedOrder.paymentMethod === 'cash' ? 'Готівка' :
                                                selectedOrder.paymentMethod === 'card' ? 'Картка' : 'Онлайн'}</span>
                                        </p>
                                        <p className="flex justify-between sm:block">
                                            <span className="text-text-muted">Загальна сума:</span> <span className="font-bold text-primary">{selectedOrder.total} ₴</span>
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div>
                                <h3 className="font-bold text-sm mb-3">Товари</h3>
                                
                                {/* Desktop Items Table */}
                                <div className="hidden sm:block border rounded-md overflow-hidden">
                                    <table className="min-w-full divide-y divide-gray-200">
                                        <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-4 py-2 text-left text-xs font-medium text-text-muted uppercase tracking-wider">Товар</th>
                                            <th className="px-4 py-2 text-left text-xs font-medium text-text-muted uppercase tracking-wider">Кількість</th>
                                            <th className="px-4 py-2 text-right text-xs font-medium text-text-muted uppercase tracking-wider">Ціна</th>
                                            <th className="px-4 py-2 text-right text-xs font-medium text-text-muted uppercase tracking-wider">Сума</th>
                                        </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-gray-200">
                                        {selectedOrder.items.map((item, index) => (
                                            <tr key={index}>
                                                <td className="px-4 py-3 whitespace-nowrap">
                                                    <div className="flex items-center">
                                                        <img src={item.imageUrl} alt={item.name} className="h-8 w-8 rounded-md object-cover mr-2" />
                                                        <span className="text-sm font-medium">{item.name}</span>
                                                    </div>
                                                </td>
                                                <td className="px-4 py-3 whitespace-nowrap text-sm">{item.quantity}</td>
                                                <td className="px-4 py-3 whitespace-nowrap text-right text-sm">{item.price} ₴</td>
                                                <td className="px-4 py-3 whitespace-nowrap text-right text-sm font-bold">{item.price * item.quantity} ₴</td>
                                            </tr>
                                        ))}
                                        </tbody>
                                    </table>
                                </div>

                                {/* Mobile Items List */}
                                <div className="sm:hidden space-y-3">
                                    {selectedOrder.items.map((item, index) => (
                                        <div key={index} className="flex items-center space-x-3 p-2 border rounded-lg">
                                            <img src={item.imageUrl} alt={item.name} className="h-12 w-12 rounded-md object-cover" />
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-bold truncate">{item.name}</p>
                                                <p className="text-xs text-text-muted">{item.quantity} x {item.price} ₴</p>
                                            </div>
                                            <div className="text-right font-bold text-sm">
                                                {item.price * item.quantity} ₴
                                            </div>
                                        </div>
                                    ))}
                                    <div className="flex justify-between items-center p-2 bg-gray-50 rounded-lg font-bold">
                                        <span>Загальна сума</span>
                                        <span className="text-primary">{selectedOrder.total} ₴</span>
                                    </div>
                                </div>
                            </div>

                            <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-4 border-t">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="w-full sm:w-auto bg-red-50 text-red-600 border-red-100 hover:bg-red-100 hover:text-red-700"
                                    onClick={() => handleStatusChange(selectedOrder.id, OrderStatus.CANCELLED)}
                                    disabled={selectedOrder.status === OrderStatus.DELIVERED || selectedOrder.status === OrderStatus.CANCELLED}
                                >
                                    <X className="h-4 w-4 mr-2" /> Скасувати замовлення
                                </Button>

                                <div className="w-full sm:w-auto flex flex-col gap-1">
                                    <p className="text-[10px] text-text-muted ml-1">Змінити статус:</p>
                                    <Select
                                        defaultValue={selectedOrder.status}
                                        onValueChange={(value) => handleStatusChange(selectedOrder.id, value as OrderStatus)}
                                    >
                                        <SelectTrigger className="w-full sm:w-[200px]">
                                            <SelectValue placeholder="Змінити статус" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value={OrderStatus.ACCEPTED}>Прийнято</SelectItem>
                                            <SelectItem value={OrderStatus.PREPARING}>Готується</SelectItem>
                                            <SelectItem value={OrderStatus.DELIVERING}>Доставляється</SelectItem>
                                            <SelectItem value={OrderStatus.DELIVERED}>Доставлено</SelectItem>
                                            <SelectItem value={OrderStatus.CANCELLED}>Скасовано</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </AdminLayout>
    );
};

export default AdminOrdersPage;
