import { 
  db, 
  collection, 
  doc, 
  getDocs, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  onSnapshot 
} from '../firebase/config';

const MESSAGES_COLLECTION = 'contactMessages';

/**
 * Submit contact message (Customer)
 */
export async function sendContactMessage(messageData) {
  try {
    const messagesRef = collection(db, MESSAGES_COLLECTION);
    const payload = {
      name: messageData.name,
      phone: messageData.phone,
      email: messageData.email || 'YOUR EMAIL',
      subject: messageData.subject || 'General Inquiry',
      message: messageData.message,
      createdAt: new Date().toISOString(),
      status: 'New' // New, Read
    };

    const docRef = await addDoc(messagesRef, payload);

    // Save to local storage as fallback
    saveMessageToLocalStorage({ id: docRef.id, ...payload });

    return { id: docRef.id, ...payload };
  } catch (error) {
    console.error('Error submitting contact message to Firestore:', error);
    const fallbackMsg = {
      id: `msg-${Date.now()}`,
      name: messageData.name,
      phone: messageData.phone,
      email: messageData.email || 'YOUR EMAIL',
      subject: messageData.subject || 'General Inquiry',
      message: messageData.message,
      createdAt: new Date().toISOString(),
      status: 'New'
    };
    saveMessageToLocalStorage(fallbackMsg);
    return fallbackMsg;
  }
}

function saveMessageToLocalStorage(msg) {
  try {
    const existing = JSON.parse(localStorage.getItem('natural_blend_messages') || '[]');
    existing.unshift(msg);
    localStorage.setItem('natural_blend_messages', JSON.stringify(existing));
  } catch (e) {}
}

/**
 * Fetch all contact messages (Admin)
 */
export async function getAllMessages() {
  try {
    const messagesRef = collection(db, MESSAGES_COLLECTION);
    const snapshot = await getDocs(messagesRef);
    const list = [];
    snapshot.forEach(docSnap => {
      list.push({ id: docSnap.id, ...docSnap.data() });
    });

    let localMsgs = [];
    try {
      localMsgs = JSON.parse(localStorage.getItem('natural_blend_messages') || '[]');
    } catch (e) {}

    const map = new Map();
    [...list, ...localMsgs].forEach(m => map.set(m.id, m));
    return Array.from(map.values()).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  } catch (error) {
    console.warn('Error fetching messages from Firestore:', error);
    try {
      return JSON.parse(localStorage.getItem('natural_blend_messages') || '[]');
    } catch (e) {
      return [];
    }
  }
}

/**
 * Realtime listener for contact messages
 */
export function subscribeToMessages(callback) {
  try {
    const messagesRef = collection(db, MESSAGES_COLLECTION);
    return onSnapshot(messagesRef, (snapshot) => {
      const list = [];
      snapshot.forEach(docSnap => {
        list.push({ id: docSnap.id, ...docSnap.data() });
      });
      list.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      callback(list);
    }, (error) => {
      console.warn('Realtime messages listener error:', error);
    });
  } catch (error) {
    console.warn('Subscribing to messages error:', error);
    return () => {};
  }
}

/**
 * Mark message as read
 */
export async function markMessageRead(id) {
  try {
    const docRef = doc(db, MESSAGES_COLLECTION, id);
    await updateDoc(docRef, { status: 'Read' });
  } catch (error) {
    console.warn('Error updating message status in Firestore:', error);
  }
  
  // Local storage sync
  try {
    const localMsgs = JSON.parse(localStorage.getItem('natural_blend_messages') || '[]');
    const updated = localMsgs.map(m => m.id === id ? { ...m, status: 'Read' } : m);
    localStorage.setItem('natural_blend_messages', JSON.stringify(updated));
  } catch (e) {}
}

/**
 * Delete message
 */
export async function deleteMessage(id) {
  try {
    const docRef = doc(db, MESSAGES_COLLECTION, id);
    await deleteDoc(docRef);
  } catch (error) {
    console.warn('Error deleting message in Firestore:', error);
  }

  try {
    const localMsgs = JSON.parse(localStorage.getItem('natural_blend_messages') || '[]');
    const updated = localMsgs.filter(m => m.id !== id);
    localStorage.setItem('natural_blend_messages', JSON.stringify(updated));
  } catch (e) {}
}
