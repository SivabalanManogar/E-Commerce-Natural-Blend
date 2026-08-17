import { 
  db, 
  collection, 
  doc, 
  getDocs, 
  setDoc, 
  addDoc, 
  updateDoc, 
  deleteDoc 
} from '../firebase/config';
import initialCategoriesData from '../data/initialCategories.json';

const CATEGORIES_COLLECTION = 'categories';

export async function getAllCategories() {
  try {
    const categoriesRef = collection(db, CATEGORIES_COLLECTION);
    const snapshot = await getDocs(categoriesRef);
    if (snapshot.empty) {
      return initialCategoriesData;
    }

    const list = [];
    snapshot.forEach(docSnap => {
      const data = docSnap.data();
      let imageUrl = data.imageUrl;
      if (data.name === 'Home Care' && (!imageUrl || imageUrl.includes('mi_home_dishwash_bar.png'))) {
        imageUrl = '/images/products/mi_home_floor_cleaner.png';
        try {
          updateDoc(doc(db, CATEGORIES_COLLECTION, docSnap.id), { imageUrl, updatedAt: new Date().toISOString() });
        } catch (e) { }
      }
      list.push({ id: docSnap.id, ...data, imageUrl });
    });
    return list;
  } catch (error) {
    console.warn('Error fetching categories, using initial dataset:', error);
    return initialCategoriesData;
  }
}

export async function seedInitialCategories() {
  try {
    const categoriesRef = collection(db, CATEGORIES_COLLECTION);
    for (const cat of initialCategoriesData) {
      const docRef = doc(categoriesRef, cat.id);
      await setDoc(docRef, {
        ...cat,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }, { merge: true });
    }
    return true;
  } catch (error) {
    console.error('Error seeding categories to Firestore:', error);
    throw error;
  }
}

export async function addCategory(categoryData) {
  try {
    const categoriesRef = collection(db, CATEGORIES_COLLECTION);
    const payload = {
      name: categoryData.name,
      imageUrl: categoryData.imageUrl || null,
      active: categoryData.active !== undefined ? categoryData.active : true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    const docRef = await addDoc(categoriesRef, payload);
    return { id: docRef.id, ...payload };
  } catch (error) {
    console.error('Error adding category:', error);
    throw error;
  }
}

export async function updateCategory(id, categoryData) {
  try {
    const docRef = doc(db, CATEGORIES_COLLECTION, id);
    const payload = {
      ...categoryData,
      updatedAt: new Date().toISOString()
    };
    await setDoc(docRef, payload, { merge: true });
    return { id, ...payload };
  } catch (error) {
    console.error('Error updating category:', error);
    throw error;
  }
}

export async function deleteCategory(id) {
  try {
    const docRef = doc(db, CATEGORIES_COLLECTION, id);
    await deleteDoc(docRef);
    return true;
  } catch (error) {
    console.error('Error deleting category:', error);
    throw error;
  }
}
