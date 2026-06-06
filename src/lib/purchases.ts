/**
 * RevenueCat (Pro entitlement). Native-only: Expo Go has no native module, so
 * everything no-ops there (dev unlocks Pro via FORCE_PRO instead).
 */
import Constants from 'expo-constants';
import { Platform } from 'react-native';

import { useAppStore } from '@/state/store';

import type { CustomerInfo } from 'react-native-purchases';
import type PurchasesType from 'react-native-purchases';

const RC_IOS_KEY = process.env.EXPO_PUBLIC_RC_IOS_KEY ?? 'appl_cIpfWvjeZpoVAJWZcmncKcUyNqF';
const ENTITLEMENT = 'pro';

const isExpoGo = Constants.executionEnvironment === 'storeClient';

let Purchases: typeof PurchasesType | null = null;
if (!isExpoGo && Platform.OS === 'ios') {
  Purchases = require('react-native-purchases').default as typeof PurchasesType;
}

const applyInfo = (info: CustomerInfo) => {
  useAppStore.getState().setPro(!!info.entitlements.active[ENTITLEMENT]);
};

export async function initPurchases(): Promise<void> {
  if (!Purchases) return;
  Purchases.configure({ apiKey: RC_IOS_KEY });
  Purchases.addCustomerInfoUpdateListener(applyInfo);
  try {
    applyInfo(await Purchases.getCustomerInfo());
  } catch {
    // offline / not signed in — keep current (default false)
  }
}

/** Returns true if Pro is now active. */
export async function purchasePro(): Promise<boolean> {
  if (!Purchases) return false;
  const offerings = await Purchases.getOfferings();
  const pkg = offerings.current?.availablePackages[0];
  if (!pkg) return false;
  try {
    const { customerInfo } = await Purchases.purchasePackage(pkg);
    applyInfo(customerInfo);
    return !!customerInfo.entitlements.active[ENTITLEMENT];
  } catch (e) {
    if ((e as { userCancelled?: boolean }).userCancelled) return false;
    throw e;
  }
}

/** Returns true if Pro is active after restoring. */
export async function restorePro(): Promise<boolean> {
  if (!Purchases) return false;
  const info = await Purchases.restorePurchases();
  applyInfo(info);
  return !!info.entitlements.active[ENTITLEMENT];
}

/** Whether real purchases are available (native build, not Expo Go). */
export const purchasesAvailable = (): boolean => Purchases !== null;
