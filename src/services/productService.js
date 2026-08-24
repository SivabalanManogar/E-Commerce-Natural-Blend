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
  serverTimestamp,
  storage,
  ref,
  uploadBytes,
  onSnapshot,
  deleteObject
} from '../firebase/config';
import initialProductsData from '../data/initialProducts.json';

const PRODUCTS_COLLECTION = 'products';

/**
 * Subscribe to all products in Firestore with real-time updates.
 * Falls back to initialProductsData if Firestore is empty or offline.
 */
export function subscribeToProducts(callback) {
  try {
    const productsRef = collection(db, PRODUCTS_COLLECTION);
    return onSnapshot(
      productsRef,
      (snapshot) => {
        if (snapshot.empty) {
          console.log('Firestore products collection empty in listener. Using initial catalog.');
          callback(initialProductsData);
          return;
        }

        const list = [];
        snapshot.forEach((docSnap) => {
          list.push({ id: docSnap.id, ...docSnap.data() });
        });
        callback(list);
      },
      (error) => {
        console.warn('Real-time products snapshot listener error:', error);
        callback(initialProductsData);
      }
    );
  } catch (error) {
    console.warn('Error creating real-time products listener:', error);
    callback(initialProductsData);
    return () => {};
  }
}

/**
 * Subscribe to a single product document by ID with real-time updates.
 */
export function subscribeToProductById(id, callback) {
  if (!id) {
    callback(null);
    return () => {};
  }

  const decodedId = decodeURIComponent(id);
  const normalizedId = decodedId.replace(/\s+/g, '-');

  try {
    const docRef = doc(db, PRODUCTS_COLLECTION, decodedId);
    return onSnapshot(
      docRef,
      (docSnap) => {
        if (docSnap.exists()) {
          callback({ id: docSnap.id, ...docSnap.data() });
        } else {
          // Fallback to local catalog search
          const match = initialProductsData.find(
            p => p.id === decodedId || 
                 p.id === id || 
                 p.id === normalizedId || 
                 p.id.replace(/-/g, ' ') === decodedId.replace(/-/g, ' ')
          );
          callback(match || null);
        }
      },
      (error) => {
        console.warn('Real-time product by id listener error:', error);
        const match = initialProductsData.find(
          p => p.id === decodedId || p.id === id || p.id === normalizedId
        );
        callback(match || null);
      }
    );
  } catch (error) {
    console.warn('Error creating real-time single product listener:', error);
    const match = initialProductsData.find(
      p => p.id === decodedId || p.id === id || p.id === normalizedId
    );
    callback(match || null);
    return () => {};
  }
}

/**
 * Get clean array of image URLs for a product with backward compatibility.
 */
export function getProductImages(product) {
  if (!product) return ['/images/products/placeholder.png'];
  if (Array.isArray(product.images) && product.images.length > 0) {
    return product.images.filter(Boolean);
  }
  const single = product.imageUrl || product.image;
  return single ? [single] : ['/images/products/placeholder.png'];
}

/**
 * Get primary image URL for product cards, cart, and orders.
 */
export function getProductPrimaryImage(product) {
  const list = getProductImages(product);
  return list[0] || '/images/products/placeholder.png';
}

/**
 * Safely delete an image from Firebase Storage if it matches a Storage URL.
 */
export async function deleteStorageImage(url) {
  if (!url || typeof url !== 'string') return;
  if (!url.includes('firebasestorage.googleapis.com') && !url.includes('storage.googleapis.com')) return;

  try {
    const fileRef = ref(storage, url);
    await deleteObject(fileRef);
    console.log('Successfully deleted file from Firebase Storage:', url);
  } catch (error) {
    console.warn('Could not delete Firebase Storage file (might already be deleted or restricted):', error);
  }
}

/**
 * Fetch all products from Firestore.
 * Falls back to initialProductsData if Firestore is empty or offline.
 */
export async function getAllProducts() {
  try {
    const productsRef = collection(db, PRODUCTS_COLLECTION);
    const snapshot = await getDocs(productsRef);
    
    if (snapshot.empty) {
      console.log('Firestore products collection empty. Using local catalog.');
      return initialProductsData;
    }

    const list = [];
    snapshot.forEach(docSnap => {
      list.push({ id: docSnap.id, ...docSnap.data() });
    });
    return list;
  } catch (error) {
    console.warn('Error fetching products from Firestore, using initial catalog:', error);
    return initialProductsData;
  }
}

/**
 * Seed all initial 33 products into Firestore.
 */
export async function seedInitialProducts() {
  try {
    const productsRef = collection(db, PRODUCTS_COLLECTION);
    for (const prod of initialProductsData) {
      const docRef = doc(productsRef, prod.id);
      await setDoc(docRef, {
        ...prod,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }, { merge: true });
    }
    console.log('Successfully seeded 33 products to Firestore!');
    return true;
  } catch (error) {
    console.error('Error seeding products to Firestore:', error);
    throw error;
  }
}

/**
 * Get product by ID. Supports URL encoded IDs, hyphens, and spaces.
 */
export async function getProductById(id) {
  if (!id) return null;
  const decodedId = decodeURIComponent(id);
  const normalizedId = decodedId.replace(/\s+/g, '-');

  // 1. Try Firestore direct lookup
  try {
    const docRef = doc(db, PRODUCTS_COLLECTION, decodedId);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() };
    }
  } catch (error) {
    console.warn('Error getting product by id from Firestore:', error);
  }

  // 2. Try Firestore lookup with hyphenated ID
  if (normalizedId !== decodedId) {
    try {
      const docRefNorm = doc(db, PRODUCTS_COLLECTION, normalizedId);
      const docSnapNorm = await getDoc(docRefNorm);
      if (docSnapNorm.exists()) {
        return { id: docSnapNorm.id, ...docSnapNorm.data() };
      }
    } catch (e) {}
  }

  // 3. Match from local catalog
  const foundInInitial = initialProductsData.find(
    p => p.id === decodedId || 
         p.id === id || 
         p.id === normalizedId || 
         p.id.replace(/-/g, ' ') === decodedId.replace(/-/g, ' ')
  );
  if (foundInInitial) return foundInInitial;

  // 4. Query all Firestore products if doc ID varies
  try {
    const allProds = await getAllProducts();
    const match = allProds.find(
      p => p.id === decodedId || 
           p.id === id || 
           p.id === normalizedId || 
           p.id.toLowerCase() === decodedId.toLowerCase()
    );
    if (match) return match;
  } catch (e) {}

  return null;
}

/**
 * Add a new product (Admin).
 */
export async function addProduct(productData) {
  try {
    const productsRef = collection(db, PRODUCTS_COLLECTION);
    const imagesList = Array.isArray(productData.images) && productData.images.length > 0 
      ? productData.images 
      : (productData.imageUrl ? [productData.imageUrl] : ['/images/products/placeholder.png']);

    const cleanData = {
      name: productData.name || '',
      categoryId: productData.categoryId || null,
      category: productData.category || 'Other',
      subCategoryId: productData.subCategoryId || null,
      subCategory: productData.subCategory || null,
      price: Number(productData.price) || 0,
      displayQuantity: Number(productData.displayQuantity) || 1,
      displayUnit: productData.displayUnit || 'g',
      shippingWeightGrams: productData.shippingWeightGrams !== null && productData.shippingWeightGrams !== '' 
        ? Number(productData.shippingWeightGrams) 
        : null,
      stockQuantity: Number(productData.stockQuantity) || 0,
      description: productData.description || '',
      directions: productData.directions || null,
      ingredients: productData.ingredients || null,
      benefits: productData.benefits || null,
      storage: productData.storage || null,
      manufacturer: productData.manufacturer || null,
      marketer: productData.marketer || null,
      shelfLife: productData.shelfLife || null,
      disclaimer: productData.disclaimer || null,
      images: imagesList,
      imageUrl: imagesList[0] || '/images/products/placeholder.png',
      active: productData.active !== undefined ? productData.active : true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const docRef = await addDoc(productsRef, cleanData);
    return { id: docRef.id, ...cleanData };
  } catch (error) {
    console.error('Error adding product:', error);
    throw error;
  }
}

/**
 * Update an existing product (Admin).
 */
export async function updateProduct(id, productData) {
  try {
    const docRef = doc(db, PRODUCTS_COLLECTION, id);
    const updatePayload = {
      ...productData,
      updatedAt: new Date().toISOString()
    };
    if (updatePayload.price !== undefined) updatePayload.price = Number(updatePayload.price);
    if (updatePayload.displayQuantity !== undefined) updatePayload.displayQuantity = Number(updatePayload.displayQuantity);
    if (updatePayload.stockQuantity !== undefined) updatePayload.stockQuantity = Number(updatePayload.stockQuantity);
    if (updatePayload.shippingWeightGrams !== undefined) {
      updatePayload.shippingWeightGrams = (updatePayload.shippingWeightGrams !== null && updatePayload.shippingWeightGrams !== '') 
        ? Number(updatePayload.shippingWeightGrams) 
        : null;
    }

    if (Array.isArray(updatePayload.images) && updatePayload.images.length > 0) {
      updatePayload.imageUrl = updatePayload.images[0];
    }

    await setDoc(docRef, updatePayload, { merge: true });
    return { id, ...updatePayload };
  } catch (error) {
    console.error('Error updating product:', error);
    throw error;
  }
}

/**
 * Delete a product (Admin).
 */
export async function deleteProduct(id) {
  try {
    const docRef = doc(db, PRODUCTS_COLLECTION, id);
    await deleteDoc(docRef);
    return true;
  } catch (error) {
    console.error('Error deleting product:', error);
    throw error;
  }
}

/**
 * Upload Product Image to Firebase Storage or convert to Data URL fallback.
 */
export async function uploadProductImage(file, productId = 'new') {
  if (!file) return null;

  try {
    const fileExt = file.name.split('.').pop();
    const fileName = `products/${productId}_${Date.now()}_${Math.random().toString(36).substring(2, 7)}.${fileExt}`;
    const storageRef = ref(storage, fileName);
    await uploadBytes(storageRef, file);
    const downloadUrl = await getDownloadURL(storageRef);
    return downloadUrl;
  } catch (error) {
    console.warn('Firebase Storage upload warning:', error);
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.onerror = (e) => reject(e);
      reader.readAsDataURL(file);
    });
  }
}

