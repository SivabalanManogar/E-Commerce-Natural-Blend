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
 * Helper to resolve document reference by Firestore doc ID or readable orderId (e.g. NB-1042)
 */
async function resolveOrderDocRef(orderIdOrDocId) {
  const directRef = doc(db, ORDERS_COLLECTION, orderIdOrDocId);
  const directSnap = await getDoc(directRef);
  if (directSnap.exists()) {
    return { ref: directRef, snap: directSnap };
  }

  const ordersRef = collection(db, ORDERS_COLLECTION);
  const q = query(ordersRef, where('orderId', '==', orderIdOrDocId));
  const querySnap = await getDocs(q);
  if (!querySnap.empty) {
    const foundDoc = querySnap.docs[0];
    return { ref: foundDoc.ref, snap: foundDoc };
  }

  throw new Error(`Order ${orderIdOrDocId} not found.`);
}

/**
 * Get customer orders strictly for the given customerUid
 */
export async function getCustomerOrders(customerUid) {
  if (!customerUid) return [];

  try {
    const ordersRef = collection(db, ORDERS_COLLECTION);
    const q = query(ordersRef, where('customerUid', '==', customerUid));
    const snapshot = await getDocs(q);
    const remoteOrders = [];

    snapshot.forEach(docSnap => {
      const data = docSnap.data();
      if (!data.deleted && data.isDeleted !== true) {
        remoteOrders.push({ id: docSnap.id, ...data });
      }
    });

    const list = remoteOrders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    try {
      localStorage.setItem(`natural_blend_orders_${customerUid}`, JSON.stringify(list));
    } catch (e) { }

    return list;
  } catch (error) {
    console.warn('Error querying orders by customerUid from Firestore:', error);
    try {
      const key = `natural_blend_orders_${customerUid}`;
      const local = JSON.parse(localStorage.getItem(key) || '[]');
      return local.filter(o => !o.deleted && o.isDeleted !== true);
    } catch (e) {
      return [];
    }
  }
}

/**
 * Realtime listener for customer's orders matching customerUid.
 * Any admin status change or order deletion instantly reflects on the user's side without page refresh!
 */
export function subscribeToCustomerOrders(customerUid, callback) {
  if (!customerUid) {
    callback([]);
    return () => { };
  }

  try {
    const ordersRef = collection(db, ORDERS_COLLECTION);
    const q = query(ordersRef, where('customerUid', '==', customerUid));

    return onSnapshot(q, (snapshot) => {
      const remoteOrders = [];
      snapshot.forEach(docSnap => {
        const data = docSnap.data();
        if (!data.deleted && data.isDeleted !== true) {
          remoteOrders.push({ id: docSnap.id, ...data });
        }
      });

      const list = remoteOrders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

      // Update localStorage cache with fresh Firestore status list
      try {
        const storageKey = `natural_blend_orders_${customerUid}`;
        localStorage.setItem(storageKey, JSON.stringify(list));
      } catch (e) { }

      callback(list);
    }, (error) => {
      console.warn('Realtime customer orders snapshot error:', error);
      try {
        const storageKey = `natural_blend_orders_${customerUid}`;
        const local = JSON.parse(localStorage.getItem(storageKey) || '[]');
        callback(local.filter(o => !o.deleted && o.isDeleted !== true));
      } catch (e) {
        callback([]);
      }
    });
  } catch (error) {
    console.warn('Error subscribing to customer orders:', error);
    try {
      const storageKey = `natural_blend_orders_${customerUid}`;
      const local = JSON.parse(localStorage.getItem(storageKey) || '[]');
      callback(local.filter(o => !o.deleted && o.isDeleted !== true));
    } catch (e) {
      callback([]);
    }
    return () => { };
  }
}

/**
 * Fetch single order with ownership validation
 */
export async function getOrderById(orderIdOrDocId, currentCustomerUid) {
  try {
    const { snap: docSnap } = await resolveOrderDocRef(orderIdOrDocId);
    if (docSnap.exists()) {
      const orderData = { id: docSnap.id, ...docSnap.data() };
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
      const data = docSnap.data();
      if (!data.deleted && data.isDeleted !== true) {
        list.push({ id: docSnap.id, ...data });
      }
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
        const data = docSnap.data();
        if (!data.deleted && data.isDeleted !== true) {
          list.push({ id: docSnap.id, ...data });
        }
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
 * BACKEND VALIDATION: If an existing order is 'Cancelled', reject any status changes permanently.
 */
export async function updateOrderStatus(orderIdOrDocId, newStatus) {
  try {
    const { ref: docRef, snap: docSnap } = await resolveOrderDocRef(orderIdOrDocId);
    const existingData = docSnap.data();

    if (existingData.status === 'Cancelled') {
      throw new Error('This order has been cancelled and cannot be changed.');
    }

    const now = new Date().toISOString();
    await updateDoc(docRef, { status: newStatus, updatedAt: now });

    // Instantly sync localStorage if present for this customer
    if (existingData.customerUid) {
      try {
        const key = `natural_blend_orders_${existingData.customerUid}`;
        const localList = JSON.parse(localStorage.getItem(key) || '[]');
        const updatedList = localList.map(o => {
          if (o.id === docSnap.id || o.orderId === existingData.orderId) {
            return { ...o, status: newStatus, updatedAt: now };
          }
          return o;
        });
        localStorage.setItem(key, JSON.stringify(updatedList));
      } catch (e) { }
    }

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
 * Delete an order permanently from Firestore & LocalStorage (Admin or Customer).
 */
export async function deleteOrder(orderIdOrDocId) {
  try {
    let docRef;
    let orderData = null;
    let targetDocId = orderIdOrDocId;

    try {
      const resolved = await resolveOrderDocRef(orderIdOrDocId);
      docRef = resolved.ref;
      orderData = resolved.snap.data();
      targetDocId = resolved.snap.id;
    } catch (resolveErr) {
      docRef = doc(db, ORDERS_COLLECTION, orderIdOrDocId);
    }

    // 1. Mark as deleted and delete document permanently from Firestore
    try {
      await updateDoc(docRef, { deleted: true, isDeleted: true });
    } catch (markErr) { }
    await deleteDoc(docRef);

    // 2. Remove order from LocalStorage customer keys
    const customerUid = orderData?.customerUid;
    const targetOrderId = orderData?.orderId || orderIdOrDocId;

    if (customerUid) {
      try {
        const key = `natural_blend_orders_${customerUid}`;
        const localList = JSON.parse(localStorage.getItem(key) || '[]');
        const filteredList = localList.filter(o => o.id !== targetDocId && o.orderId !== targetOrderId);
        localStorage.setItem(key, JSON.stringify(filteredList));
      } catch (e) { }
    }

    try {
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i);
        if (k && k.startsWith('natural_blend_orders_')) {
          const list = JSON.parse(localStorage.getItem(k) || '[]');
          const clean = list.filter(o => o.id !== targetDocId && o.orderId !== targetOrderId);
          localStorage.setItem(k, JSON.stringify(clean));
        }
      }
    } catch (e) { }

    return true;
  } catch (error) {
    console.error('Error deleting order permanently:', error);
    throw error;
  }
}

/**
 * Restore an order to Firestore & LocalStorage if UNDO is clicked.
 */
export async function restoreOrder(orderDoc) {
  try {
    const targetDocId = orderDoc.id || orderDoc.orderId;
    const docRef = doc(db, ORDERS_COLLECTION, targetDocId);

    const cleanDoc = { ...orderDoc };
    delete cleanDoc.id;

    await setDoc(docRef, cleanDoc);

    if (orderDoc.customerUid) {
      try {
        const key = `natural_blend_orders_${orderDoc.customerUid}`;
        const existing = JSON.parse(localStorage.getItem(key) || '[]');
        const exists = existing.some(o => (o.id === targetDocId || o.orderId === orderDoc.orderId));
        if (!exists) {
          existing.unshift(orderDoc);
          localStorage.setItem(key, JSON.stringify(existing));
        }
      } catch (e) { }
    }

    return true;
  } catch (error) {
    console.error('Error restoring order via UNDO:', error);
    throw error;
  }
}

/**
 * Update order items/details in Firestore safely by document resolver.
 */
export async function updateOrderDetails(orderIdOrDocId, updatePayload) {
  try {
    const { ref: docRef } = await resolveOrderDocRef(orderIdOrDocId);
    await updateDoc(docRef, { ...updatePayload, updatedAt: new Date().toISOString() });
    return true;
  } catch (error) {
    console.error('Error updating order details in Firestore:', error);
    throw error;
  }
}
