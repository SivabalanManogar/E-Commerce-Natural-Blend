import { 
  db, 
  collection, 
  doc, 
  getDocs, 
  setDoc, 
  addDoc, 
  updateDoc, 
  deleteDoc,
  query,
  where,
  onSnapshot
} from '../firebase/config';

const SUBCATEGORIES_COLLECTION = 'subcategories';

/**
 * Fetch all subcategories from Firestore.
 */
export async function getAllSubcategories() {
  try {
    const subRef = collection(db, SUBCATEGORIES_COLLECTION);
    const snapshot = await getDocs(subRef);
    const list = [];
    snapshot.forEach(docSnap => {
      list.push({ id: docSnap.id, ...docSnap.data() });
    });
    return list;
  } catch (error) {
    console.error('Error fetching subcategories from Firestore:', error);
    return [];
  }
}

/**
 * Real-time listener for subcategories collection.
 */
export function subscribeToSubcategories(callback) {
  try {
    const subRef = collection(db, SUBCATEGORIES_COLLECTION);
    return onSnapshot(subRef, (snapshot) => {
      const list = [];
      snapshot.forEach(docSnap => {
        list.push({ id: docSnap.id, ...docSnap.data() });
      });
      callback(list);
    }, (error) => {
      console.warn('Error in subcategories realtime listener:', error);
    });
  } catch (err) {
    console.error('Failed to subscribe to subcategories:', err);
    return () => {};
  }
}

/**
 * Get subcategories filtered by parentCategoryId.
 */
export async function getSubcategoriesByParentId(parentCategoryId) {
  if (!parentCategoryId) return [];
  try {
    const all = await getAllSubcategories();
    return all.filter(sub => 
      sub.parentCategoryId === parentCategoryId || 
      (sub.parentCategoryName && sub.parentCategoryName.toLowerCase() === parentCategoryId.toLowerCase())
    );
  } catch (error) {
    console.error('Error getting subcategories by parent ID:', error);
    return [];
  }
}

/**
 * Check if a subcategory name already exists under the same parent category (case-insensitive).
 */
export async function isDuplicateSubcategoryName(name, parentCategoryId, excludeId = null) {
  if (!name || !parentCategoryId) return false;
  const normalizedNewName = name.trim().toLowerCase();
  const allSubcategories = await getAllSubcategories();
  
  return allSubcategories.some(sub => {
    if (excludeId && sub.id === excludeId) return false;
    const sameParent = sub.parentCategoryId === parentCategoryId || 
      (sub.parentCategoryName && sub.parentCategoryName.toLowerCase() === parentCategoryId.toLowerCase());
    return sameParent && sub.name && sub.name.trim().toLowerCase() === normalizedNewName;
  });
}

/**
 * Add a new subcategory.
 */
export async function addSubcategory(subcategoryData) {
  try {
    const isDup = await isDuplicateSubcategoryName(
      subcategoryData.name, 
      subcategoryData.parentCategoryId
    );
    if (isDup) {
      throw new Error(`A sub-category named "${subcategoryData.name.trim()}" already exists in this main category.`);
    }

    const subRef = collection(db, SUBCATEGORIES_COLLECTION);
    const payload = {
      name: subcategoryData.name.trim(),
      parentCategoryId: subcategoryData.parentCategoryId,
      imageUrl: subcategoryData.imageUrl || null,
      active: subcategoryData.active !== undefined ? subcategoryData.active : true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    const docRef = await addDoc(subRef, payload);
    return { id: docRef.id, ...payload };
  } catch (error) {
    console.error('Error adding subcategory:', error);
    throw error;
  }
}

/**
 * Update an existing subcategory.
 */
export async function updateSubcategory(id, subcategoryData) {
  try {
    if (subcategoryData.name && subcategoryData.parentCategoryId) {
      const isDup = await isDuplicateSubcategoryName(
        subcategoryData.name, 
        subcategoryData.parentCategoryId, 
        id
      );
      if (isDup) {
        throw new Error(`A sub-category named "${subcategoryData.name.trim()}" already exists in this main category.`);
      }
    }

    const docRef = doc(db, SUBCATEGORIES_COLLECTION, id);
    const payload = {
      ...subcategoryData,
      updatedAt: new Date().toISOString()
    };
    if (payload.name) payload.name = payload.name.trim();

    await setDoc(docRef, payload, { merge: true });
    return { id, ...payload };
  } catch (error) {
    console.error('Error updating subcategory:', error);
    throw error;
  }
}

/**
 * Delete a subcategory.
 */
export async function deleteSubcategory(id) {
  try {
    const docRef = doc(db, SUBCATEGORIES_COLLECTION, id);
    await deleteDoc(docRef);
    return true;
  } catch (error) {
    console.error('Error deleting subcategory:', error);
    throw error;
  }
}
