
import { db } from "@/lib/firebase";
import { 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  getDoc, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  limit,
  runTransaction,
  setDoc as firestoreSetDoc 
} from "firebase/firestore";
import { Order, OrderItem, OrderStatus } from "@/models/Order";

const ORDERS_COLLECTION = "orders";
const COUNTERS_COLLECTION = "counters";
const ORDER_COUNTER_ID = "orderCounter";

// Create a new order with sequential ID
export const createOrder = async (orderData: Omit<Order, 'id' | 'createdAt'>): Promise<Order> => {
  try {
    // Generate sequential order number
    const orderNumber = await getNextOrderNumber();
    
    // Format order ID
    const orderId = `ORD-${orderNumber}`;
    
    // Add createdAt field
    const orderWithTimestamp = {
      ...orderData,
      id: orderId,
      createdAt: new Date().toISOString()
    };
    
    await firestoreSetDoc(doc(db, ORDERS_COLLECTION, orderId), orderWithTimestamp);
    
    console.log("Order created successfully in Firestore:", orderId);
    
    // Also save to localStorage for offline access
    saveOrderToLocalStorage(orderWithTimestamp as Order);
    
    return orderWithTimestamp as Order;
  } catch (error) {
    console.error("Error creating order in Firestore:", error);
    
    // Fallback to localStorage only with sequential ID
    return createOrderLocally(orderData);
  }
};

// Get next order number from counter collection
const getNextOrderNumber = async (): Promise<number> => {
  const counterRef = doc(db, COUNTERS_COLLECTION, ORDER_COUNTER_ID);
  
  try {
    const orderNumber = await runTransaction(db, async (transaction) => {
      const counterDoc = await transaction.get(counterRef);
      
      if (!counterDoc.exists()) {
        // Initialize counter if it doesn't exist
        transaction.set(counterRef, { value: 32801 });
        return 32801;
      }
      
      const newValue = counterDoc.data().value + 1;
      transaction.update(counterRef, { value: newValue });
      return newValue;
    });
    
    return orderNumber;
  } catch (error) {
    console.error("Failed to get next order number:", error);
    // Fallback to timestamp-based number
    return Math.floor(32800 + Date.now() % 10000);
  }
};

// Get all orders (for Admin)
export const getAllOrders = async (): Promise<Order[]> => {
  try {
    const q = query(collection(db, ORDERS_COLLECTION));
    const querySnapshot = await getDocs(q);
    
    const orders = querySnapshot.docs.map(doc => ({
      ...doc.data(),
      id: doc.id
    } as Order));

    // Sort in JS to avoid index requirement
    return orders.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  } catch (error) {
    console.error("Error getting all orders:", error);
    return getOrdersFromLocalStorage().sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }
};

// Get orders for a specific user, optionally including guest orders from local storage
export const getUserOrders = async (userId: string | null, guestOrderIds: string[] = []): Promise<Order[]> => {
  try {
    let firestoreOrders: Order[] = [];
    
    if (userId) {
      console.log("Fetching orders for user:", userId);
      const q = query(
        collection(db, ORDERS_COLLECTION),
        where("userId", "==", userId)
      );
      const querySnapshot = await getDocs(q);
      firestoreOrders = querySnapshot.docs.map(doc => ({
        ...doc.data(),
        id: doc.id
      } as Order));
    }

    // Also fetch specific guest orders if provided
    if (guestOrderIds.length > 0) {
        const guestQ = query(
            collection(db, ORDERS_COLLECTION),
            where("id", "in", guestOrderIds.slice(0, 30))
        );
        const guestSnapshot = await getDocs(guestQ);
        const fetchedGuestOrders = guestSnapshot.docs.map(doc => ({
            ...doc.data(),
            id: doc.id
        } as Order));
        
        firestoreOrders = [...firestoreOrders, ...fetchedGuestOrders];
    }
    
    const localOrders = getOrdersFromLocalStorage();
    
    const allOrdersMap = new Map();
    localOrders.forEach(order => {
        if ((userId && order.userId === userId) || guestOrderIds.includes(order.id)) {
            allOrdersMap.set(order.id, order);
        }
    });
    firestoreOrders.forEach(order => allOrdersMap.set(order.id, order));
    
    const combinedOrders = Array.from(allOrdersMap.values());

    return combinedOrders.sort((a, b) => {
        const dateA = new Date(a.createdAt).getTime();
        const dateB = new Date(b.createdAt).getTime();
        return dateB - dateA;
    });
  } catch (error) {
    console.error("Error getting user orders:", error);
    const allOrders = getOrdersFromLocalStorage();
    return allOrders
      .filter(order => (userId && order.userId === userId) || guestOrderIds.includes(order.id))
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }
};

export const claimGuestOrders = async (userId: string, userEmail: string, guestOrderIds: string[]): Promise<void> => {
    if (!guestOrderIds.length) return;
    
    console.log(`Claiming ${guestOrderIds.length} orders for user ${userId}`);
    
    try {
        const localOrders = getOrdersFromLocalStorage();
        let localUpdated = false;

        for (const orderId of guestOrderIds) {
            const orderRef = doc(db, ORDERS_COLLECTION, orderId);
            const orderSnap = await getDoc(orderRef);
            
            if (orderSnap.exists()) {
                const data = orderSnap.data();
                if (!data.userId) {
                    await updateDoc(orderRef, {
                        userId: userId,
                        userEmail: userEmail
                    });
                    console.log(`Order ${orderId} claimed in Firestore`);
                }
            }

            const localIndex = localOrders.findIndex(o => o.id === orderId);
            if (localIndex !== -1 && !localOrders[localIndex].userId) {
                localOrders[localIndex] = {
                    ...localOrders[localIndex],
                    userId: userId,
                    userEmail: userEmail
                };
                localUpdated = true;
            }
        }

        if (localUpdated) {
            localStorage.setItem("shawarma_timaro_orders", JSON.stringify(localOrders));
        }
    } catch (error) {
        console.error("Error claiming guest orders:", error);
    }
};

// Get order by ID
export const getOrderById = async (orderId: string): Promise<Order | null> => {
  try {
    const orderDoc = await getDoc(doc(db, ORDERS_COLLECTION, orderId));
    
    if (orderDoc.exists()) {
      return {
        ...orderDoc.data(),
        id: orderDoc.id
      } as Order;
    }
    return null;
  } catch (error) {
    console.error("Error getting order by ID:", error);
    const allOrders = getOrdersFromLocalStorage();
    return allOrders.find(order => order.id === orderId) || null;
  }
};

// Update order status
export const updateOrderStatus = async (orderId: string, status: OrderStatus): Promise<Order> => {
  try {
    const orderRef = doc(db, ORDERS_COLLECTION, orderId);
    await updateDoc(orderRef, { status });
    
    const updatedDoc = await getDoc(orderRef);
    const updatedOrder = {
      ...updatedDoc.data(),
      id: orderId
    } as Order;
    
    updateOrderInLocalStorage(updatedOrder);
    return updatedOrder;
  } catch (error) {
    console.error("Error updating order status:", error);
    return updateOrderStatusLocally(orderId, status);
  }
};

// Helper function for creating/updating documents
const setDoc = async (docRef: any, data: any) => {
  try {
    await firestoreSetDoc(docRef, data, { merge: true });
  } catch (error) {
    console.error("Error in setDoc:", error);
    throw error;
  }
};

// Local storage helpers
async function createOrderLocally(orderData: Omit<Order, 'id' | 'createdAt'>): Promise<Order> {
  const orders = getOrdersFromLocalStorage();
  let nextNumber = 32801;
  
  if (orders.length > 0) {
    const orderNumbers = orders
      .map(order => {
        const match = order.id.match(/ORD-(\d+)/);
        return match ? parseInt(match[1]) : 0;
      })
      .filter(num => !isNaN(num));
    
    if (orderNumbers.length > 0) {
      nextNumber = Math.max(...orderNumbers) + 1;
    }
  }
  
  const newOrder: Order = {
    ...orderData,
    id: `ORD-${nextNumber}`,
    createdAt: new Date().toISOString()
  };
  
  saveOrderToLocalStorage(newOrder);
  return newOrder;
}

function updateOrderStatusLocally(orderId: string, status: OrderStatus): Order {
  const orders = getOrdersFromLocalStorage();
  const orderIndex = orders.findIndex(order => order.id === orderId);
  
  if (orderIndex === -1) {
    throw new Error(`Order with ID ${orderId} not found`);
  }
  
  orders[orderIndex] = {
    ...orders[orderIndex],
    status
  };
  
  localStorage.setItem("shawarma_timaro_orders", JSON.stringify(orders));
  return orders[orderIndex];
}

function saveOrderToLocalStorage(order: Order): void {
  const orders = getOrdersFromLocalStorage();
  const existingOrderIndex = orders.findIndex(o => o.id === order.id);
  
  if (existingOrderIndex !== -1) {
    orders[existingOrderIndex] = order;
  } else {
    orders.push(order);
  }
  
  localStorage.setItem("shawarma_timaro_orders", JSON.stringify(orders));
}

function updateOrderInLocalStorage(updatedOrder: Order): void {
  const orders = getOrdersFromLocalStorage();
  const orderIndex = orders.findIndex(order => order.id === updatedOrder.id);
  
  if (orderIndex !== -1) {
    orders[orderIndex] = updatedOrder;
    localStorage.setItem("shawarma_timaro_orders", JSON.stringify(orders));
  }
}

function getOrdersFromLocalStorage(): Order[] {
  const storedOrders = localStorage.getItem("shawarma_timaro_orders");
  if (storedOrders) {
    try {
      return JSON.parse(storedOrders);
    } catch (error) {
      console.error("Failed to parse stored orders:", error);
    }
  }
  return [];
}

export const initializeOrders = async (): Promise<void> => {
  try {
    const querySnapshot = await getDocs(collection(db, ORDERS_COLLECTION));
    if (querySnapshot.empty) {
      const orders = getOrdersFromLocalStorage();
      if (orders.length > 0) {
        for (const order of orders) {
          await firestoreSetDoc(doc(db, ORDERS_COLLECTION, order.id), order);
        }
        const orderNumbers = orders
          .map(order => {
            const match = order.id.match(/ORD-(\d+)/);
            return match ? parseInt(match[1]) : 0;
          })
          .filter(num => !isNaN(num));
        
        if (orderNumbers.length > 0) {
          const maxNumber = Math.max(...orderNumbers);
          await firestoreSetDoc(doc(db, COUNTERS_COLLECTION, ORDER_COUNTER_ID), { value: maxNumber });
        }
      }
    }
  } catch (error: any) {
    if (error.code === 'permission-denied') {
      console.log("Firebase: No permission to initialize orders (skipping)");
    } else {
      console.error("Error initializing orders:", error);
    }
  }
};
