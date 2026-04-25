import axiosInstance from './axiosInstance';
import type { ShopItem, UserInventoryItem, PurchaseResult } from '../types';

export const getShopItemsApi = async (): Promise<ShopItem[]> => {
  const res = await axiosInstance.get('/Shop/items');
  return res.data;
};

export const purchaseItemApi = async (itemId: string): Promise<PurchaseResult> => {
  const res = await axiosInstance.post(`/Shop/purchase/${itemId}`);
  return res.data;
};

export const getInventoryApi = async (): Promise<UserInventoryItem[]> => {
  const res = await axiosInstance.get('/Shop/inventory');
  return res.data;
};

export const seedShopApi = async (): Promise<string> => {
  const res = await axiosInstance.post('/Shop/seed');
  return res.data;
};
