import { collection, getDocs, addDoc, query, where, serverTimestamp } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Product, CartItem } from '../types';
import { OperationType, handleFirestoreError } from '../context/AuthContext';
import { MOCK_PRODUCTS } from '../lib/mockData';

const PRODUCTS_COLLECTION = 'products';
const ORDERS_COLLECTION = 'orders';

export const ProductService = {
  async getProducts(): Promise<Product[]> {
    try {
      const querySnapshot = await getDocs(collection(db, PRODUCTS_COLLECTION));
      const products = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product));
      
      // If collection is empty, return mock data but don't try to save it to Firestore
      // Seeding should be done by an admin
      if (products.length === 0) {
        console.log('No products in Firestore, using mock data');
        return MOCK_PRODUCTS;
      }
      
      return products;
    } catch (error) {
      try {
        handleFirestoreError(error, OperationType.LIST, PRODUCTS_COLLECTION);
      } catch (e) {
        // Ignore the thrown error from handleFirestoreError
      }
      console.log('Error fetching from Firestore, falling back to mock data');
      return MOCK_PRODUCTS;
    }
  },

  async createOrder(userId: string, items: CartItem[], total: number, shippingAddress: any) {
    try {
      const orderData = {
        userId,
        items,
        total,
        shippingAddress,
        status: 'pending',
        createdAt: serverTimestamp(),
      };
      const docRef = await addDoc(collection(db, ORDERS_COLLECTION), orderData);
      return docRef.id;
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, ORDERS_COLLECTION);
    }
  }
};
