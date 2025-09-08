
import { db } from './firebase';
import {
  collection,
  addDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  doc,
  query,
  orderBy,
  Timestamp,
  getDoc,
  setDoc,
  where,
  writeBatch,
} from 'firebase/firestore';
import type { DeliveryRecord, PaymentRecord, Rates } from './types';
import { DEFAULT_RATES } from './constants';

const DELIVERY_RECORDS_COLLECTION = 'deliveryRecords';
const PAYMENTS_COLLECTION = 'payments';
const RATES_DOCUMENT = 'rates';

// Firestore data structure might differ from client-side types
type FirestoreDeliveryRecord = {
  date: Timestamp;
  item: 'milk' | 'water' | 'house-cleaning' | 'gardener';
  quantity: number;
  billedQuantity?: number;
  status: 'delivered' | 'returned';
};

type FirestorePaymentRecord = {
    date: Timestamp;
    item: 'milk' | 'water' | 'house-cleaning' | 'gardener';
    amount: number;
    reason?: string;
    attachment?: string;
}

// Converts a Firestore doc to a client-side DeliveryRecord
const deliveryFromFirestore = (doc: any): DeliveryRecord => {
  const data = doc.data();
  return {
    id: doc.id,
    date: data.date.toDate().toISOString(),
    item: data.item,
    quantity: data.quantity,
    billedQuantity: data.billedQuantity,
    status: data.status || 'delivered', // Default to 'delivered' for old records
  };
};

const paymentFromFirestore = (doc: any): PaymentRecord => {
    const data = doc.data();
    return {
        id: doc.id,
        date: data.date.toDate().toISOString(),
        item: data.item,
        amount: data.amount,
        reason: data.reason || '',
        attachment: data.attachment || '',
    }
}

export const getDeliveryRecords = async (): Promise<DeliveryRecord[]> => {
  const q = query(collection(db, DELIVERY_RECORDS_COLLECTION), orderBy('date', 'desc'));
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(deliveryFromFirestore);
};

export const addDeliveryRecord = async (record: Omit<DeliveryRecord, 'id'>) => {
  const { billedQuantity, ...rest } = record;
  const recordToAdd: Omit<DeliveryRecord, 'id' | 'billedQuantity'> & {billedQuantity?: number} = {
    ...rest,
    date: Timestamp.fromDate(new Date(record.date)) as any,
  }
  if (billedQuantity !== undefined) {
    recordToAdd.billedQuantity = billedQuantity;
  }
  const docRef = await addDoc(collection(db, DELIVERY_RECORDS_COLLECTION), recordToAdd);
  return docRef.id;
};

export const updateDeliveryRecord = async (record: DeliveryRecord) => {
  const docRef = doc(db, DELIVERY_RECORDS_COLLECTION, record.id);
  const { id, ...dataToUpdate } = record;
  
  const updateData: Partial<FirestoreDeliveryRecord> = {
      ...dataToUpdate,
      date: Timestamp.fromDate(new Date(dataToUpdate.date)),
  }

  if (dataToUpdate.billedQuantity === undefined || dataToUpdate.billedQuantity === null || isNaN(dataToUpdate.billedQuantity)) {
    delete updateData.billedQuantity;
  }

  await updateDoc(docRef, updateData);
};

export const deleteDeliveryRecord = async (id: string) => {
  const docRef = doc(db, DELIVERY_RECORDS_COLLECTION, id);
  await deleteDoc(docRef);
};

export const getPaymentRecords = async (): Promise<PaymentRecord[]> => {
    const q = query(collection(db, PAYMENTS_COLLECTION), orderBy('date', 'desc'));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(paymentFromFirestore);
}

export const addPaymentRecord = async (record: Omit<PaymentRecord, 'id'>) => {
    const docRef = await addDoc(collection(db, PAYMENTS_COLLECTION), {
        date: Timestamp.fromDate(new Date(record.date)),
        item: record.item,
        amount: record.amount,
        reason: record.reason || '',
        attachment: record.attachment || '',
    });
    return docRef.id;
}

export const updatePaymentRecord = async (record: PaymentRecord) => {
    const docRef = doc(db, PAYMENTS_COLLECTION, record.id);
    const { id, ...dataToUpdate } = record;
    await updateDoc(docRef, {
        ...dataToUpdate,
        date: Timestamp.fromDate(new Date(dataToUpdate.date)),
    });
};

export const deletePaymentRecord = async (id: string) => {
    const docRef = doc(db, PAYMENTS_COLLECTION, id);
    await deleteDoc(docRef);
}


export const deleteRecordsByItem = async (item: string) => {
    const deliveryQuery = query(collection(db, DELIVERY_RECORDS_COLLECTION), where('item', '==', item));
    const paymentQuery = query(collection(db, PAYMENTS_COLLECTION), where('item', '==', item));
    
    const [deliverySnapshot, paymentSnapshot] = await Promise.all([
        getDocs(deliveryQuery),
        getDocs(paymentQuery)
    ]);

    const batch = writeBatch(db);
    deliverySnapshot.docs.forEach(doc => batch.delete(doc.ref));
    paymentSnapshot.docs.forEach(doc => batch.delete(doc.ref));

    if (!deliverySnapshot.empty || !paymentSnapshot.empty) {
        await batch.commit();
    }
}

export const getRates = async (): Promise<Rates | null> => {
  const docRef = doc(db, RATES_DOCUMENT, 'currentRates');
  const docSnap = await getDoc(docRef);

  if (docSnap.exists()) {
    return docSnap.data() as Rates;
  } else {
    // If no rates are set, create them with default values
    await setDoc(docRef, DEFAULT_RATES);
    return DEFAULT_RATES;
  }
};

export const updateRates = async (newRates: Rates) => {
  const docRef = doc(db, RATES_DOCUMENT, 'currentRates');
  await setDoc(docRef, newRates);
};
