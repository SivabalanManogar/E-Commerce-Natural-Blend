import {
  db,
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  onSnapshot,
  auth
} from '../firebase/config';
import { calculateDeliveryCharge } from '../utils/delivery';

const ORDERS_COLLECTION = 'orders';
const PRODUCTS_COLLECTION = 'products';

/**
 * Generate readable unique order ID (e.g. NB-1042)
 */
export function generateOrderId() {
  const random = Math.floor(1000 + Math.random() * 9000);
  return `NB-${random}`;
}

/**
 * Create a new order in Firestore with customerUid snapshot & stock deduction.
 */
export async function createOrder(orderPayload) {
  const currentUser = auth.currentUser;
  const customerUid = currentUser ? currentUser.uid : orderPayload.customerUid;
  const customerPhone = currentUser ? currentUser.phoneNumber : orderPayload.phone;

  if (!customerUid) {
    throw new Error('Authentication required. Customer must be logged in to place an order.');
  }

  try {
    const orderId = generateOrderId();
    const now = new Date().toISOString();

    // Prepare item snapshots
    const itemsSnapshot = orderPayload.items.map(item => ({
      productId: item.id || item.productId,
      productName: item.name || item.productName,
      priceAtPurchase: Number(item.price),
      quantity: Number(item.quantity),
      displayQuantity: item.displayQuantity,
      displayUnit: item.displayUnit,
      shippingWeightGrams: item.shippingWeightGrams !== null ? Number(item.shippingWeightGrams) : null,
      imageUrl: item.imageUrl
    }));

    // Calculate totals explicitly
    const productTotal = itemsSnapshot.reduce((sum, i) => sum + (i.priceAtPurchase * i.quantity), 0);

    // Calculate total weight in grams
    const totalWeight = itemsSnapshot.reduce((sum, i) => {
      const itemWeight = i.shippingWeightGrams ? (i.shippingWeightGrams * i.quantity) : 0;
      return sum + itemWeight;
    }, 0);

    const deliveryCharge = calculateDeliveryCharge(totalWeight);
    const grandTotal = productTotal + deliveryCharge;

    const fullOrderDoc = {
      orderId: orderId,
      customerUid: customerUid,
      customerName: orderPayload.customerName,
      phone: customerPhone || orderPayload.phone,
      address: orderPayload.address,
      city: orderPayload.city,
      state: orderPayload.state,
      pincode: orderPayload.pincode,
      items: itemsSnapshot,
      productTotal,
      totalWeight,
      deliveryCharge,
      grandTotal,
      status: 'Pending',
      createdAt: now,
      updatedAt: now,
      seenByAdmin: false
    };

    // Save to Firestore
    const ordersRef = collection(db, ORDERS_COLLECTION);
    const docRef = await addDoc(ordersRef, fullOrderDoc);

    // Update product stocks in Firestore
    for (const item of itemsSnapshot) {
      if (item.productId) {
        try {
          const prodDocRef = doc(db, PRODUCTS_COLLECTION, item.productId);
          const prodSnap = await getDoc(prodDocRef);
          if (prodSnap.exists()) {
            const currentStock = prodSnap.data().stockQuantity || 0;
            const newStock = Math.max(0, currentStock - item.quantity);
            await updateDoc(prodDocRef, { stockQuantity: newStock, updatedAt: now });
          }
        } catch (stkErr) {
          console.warn(`Stock update non-fatal error for product ${item.productId}:`, stkErr);
        }
      }
    }

    // Save order to localStorage scoped to customerUid for instant local tracking
    saveOrderToLocalStorage(customerUid, { id: docRef.id, ...fullOrderDoc });

    return { id: docRef.id, ...fullOrderDoc };
  } catch (error) {
    console.error('Error creating order in Firestore:', error);
    throw error;
  }
}

/**
 * Save order to localStorage customer list (isolated by customerUid)
 */
function saveOrderToLocalStorage(customerUid, order) {
  try {
    const key = `natural_blend_orders_${customerUid}`;
    const existing = JSON.parse(localStorage.getItem(key) || '[]');
    existing.unshift(order);
    localStorage.setItem(key, JSON.stringify(existing));
  } catch (err) {
    console.warn('LocalStorage order save failed:', err);
  }
}

/**
 * Get customer orders strictly for the given customerUid
 */
export async function getCustomerOrders(customerUid) {
  if (!customerUid) return [];

  let localOrders = [];
  try {
    const key = `natural_blend_orders_${customerUid}`;
    localOrders = JSON.parse(localStorage.getItem(key) || '[]');
  } catch (e) { }

  try {
    const ordersRef = collection(db, ORDERS_COLLECTION);
    const q = query(ordersRef, where('customerUid', '==', customerUid));
    const snapshot = await getDocs(q);
    const remoteOrders = [];
    snapshot.forEach(docSnap => {
      remoteOrders.push({ id: docSnap.id, ...docSnap.data() });
    });

    // Combine local & remote uniquely
    const map = new Map();
    [...remoteOrders, ...localOrders].forEach(o => {
      const key = o.orderId || o.id;
      if (!map.has(key)) map.set(key, o);
    });

    return Array.from(map.values()).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  } catch (error) {
    console.warn('Error querying orders by customerUid from Firestore:', error);
    return localOrders;
  }
}

/**
 * Fetch single order with ownership validation
 */
export async function getOrderById(orderIdOrDocId, currentCustomerUid) {
  try {
    const docRef = doc(db, ORDERS_COLLECTION, orderIdOrDocId);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      const orderData = { id: docSnap.id, ...docSnap.data() };
      // Verify ownership
      if (orderData.customerUid !== currentCustomerUid) {
        throw new Error('You do not have permission to view this order.');
      }
      return orderData;
    }
  } catch (error) {
    console.error('Error fetching order by id:', error);
    throw error;
  }
  return null;
}

/**
 * Fetch all orders for Admin.
 */
export async function getAllOrders() {
  try {
    const ordersRef = collection(db, ORDERS_COLLECTION);
    const snapshot = await getDocs(ordersRef);
    const list = [];
    snapshot.forEach(docSnap => {
      list.push({ id: docSnap.id, ...docSnap.data() });
    });
    return list.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  } catch (error) {
    console.warn('Firestore orders fetch error:', error);
    return [];
  }
}

/**
 * Realtime listener for Admin Orders & unread notification count.
 */
export function subscribeToOrders(callback) {
  try {
    const ordersRef = collection(db, ORDERS_COLLECTION);
    return onSnapshot(ordersRef, (snapshot) => {
      const list = [];
      snapshot.forEach(docSnap => {
        list.push({ id: docSnap.id, ...docSnap.data() });
      });
      list.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      callback(list);
    }, (error) => {
      console.warn('Realtime orders snapshot error:', error);
    });
  } catch (error) {
    console.warn('Error subscribing to orders:', error);
    return () => { };
  }
}

/**
 * Update Order status (Admin).
 */
export async function updateOrderStatus(orderIdOrDocId, newStatus) {
  try {
    const now = new Date().toISOString();
    const docRef = doc(db, ORDERS_COLLECTION, orderIdOrDocId);
    await updateDoc(docRef, { status: newStatus, updatedAt: now });
    return true;
  } catch (error) {
    console.error('Error updating order status in Firestore:', error);
    throw error;
  }
}

/**
 * Mark order notification as seen by Admin.
 */
export async function markOrderSeen(orderIdOrDocId) {
  try {
    const docRef = doc(db, ORDERS_COLLECTION, orderIdOrDocId);
    await updateDoc(docRef, { seenByAdmin: true });
    return true;
  } catch (error) {
    console.warn('Error marking order seen:', error);
    return false;
  }
}

/**
 * Delete an order permanently from Firestore (Admin).
 */
export async function deleteOrder(orderIdOrDocId) {
  try {
    const docRef = doc(db, ORDERS_COLLECTION, orderIdOrDocId);
    await deleteDoc(docRef);
    return true;
  } catch (error) {
    console.error('Error deleting order from Firestore:', error);
    throw error;
  }
}
