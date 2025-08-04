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
} from 'firebase/firestore';
import type { DeliveryRecord } from './types';

const DELIVERY_RECORDS_COLLECTION = 'deliveryRecords';

// Firestore data structure might differ from client-side types
type FirestoreDeliveryRecord = {
  date: Timestamp;
  item: 'milk' | 'water';
  quantity: number;
};

// Converts a Firestore doc to a client-side DeliveryRecord
const fromFirestore = (doc: any): DeliveryRecord => {
  const data = doc.data();
  return {
    id: doc.id,
    date: data.date.toDate().toISOString(),
    item: data.item,
    quantity: data.quantity,
  };
};

export const getDeliveryRecords = async (): Promise<DeliveryRecord[]> => {
  const q = query(collection(db, DELIVERY_RECORDS_COLLECTION), orderBy('date', 'desc'));
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(fromFirestore);
};

export const addDeliveryRecord = async (record: Omit<DeliveryRecord, 'id'>) => {
  const docRef = await addDoc(collection(db, DELIVERY_RECORDS_COLLECTION), {
    date: Timestamp.fromDate(new Date(record.date)),
    item: record.item,
    quantity: record.quantity,
  });
  return docRef.id;
};

export const updateDeliveryRecord = async (record: DeliveryRecord) => {
  const docRef = doc(db, DELIVERY_RECORDS_COLLECTION, record.id);
  const { id, ...dataToUpdate } = record;
  await updateDoc(docRef, {
    ...dataToUpdate,
    date: Timestamp.fromDate(new Date(dataToUpdate.date)),
  });
};

export const deleteDeliveryRecord = async (id: string) => {
  const docRef = doc(db, DELIVERY_RECORDS_COLLECTION, id);
  await deleteDoc(docRef);
};
