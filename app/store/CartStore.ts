import { create } from "zustand";
import { CartDetailItem, Package } from "../types/Clinic";
import {
  getCart,
  addToCartAPI,
  updateCartQuantityAPI,
  deleteCartItemAPI,
} from "../lib/clinic.api";

interface CartStore {
  items: CartDetailItem[];
  isCartOpen: boolean;
  isAppointmentModalOpen: boolean;
  selectedPackage: Package | null;
  loading: boolean;

  // Actions
  openCart: () => void;
  closeCart: () => void;
  toggleCart: () => void;

  openAppointmentModal: (pkg?: Package | null) => void;
  closeAppointmentModal: () => void;

  addItem: (pkg: Package, quantity?: number) => Promise<boolean>;
  updateQuantity: (packageId: number, quantity: number) => Promise<void>;
  removeItem: (packageId: number) => Promise<void>;
  clearCart: () => void;

  syncWithBackend: () => Promise<void>;

  getTotalItems: () => number;
  getTotalAmount: () => number;
}

const getInitialItems = (): CartDetailItem[] => {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem("medicare_cart");
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

const saveItemsToLocal = (items: CartDetailItem[]) => {
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem("medicare_cart", JSON.stringify(items));
    } catch {}
  }
};

export const useCartStore = create<CartStore>((set, get) => ({
  items: getInitialItems(),
  isCartOpen: false,
  isAppointmentModalOpen: false,
  selectedPackage: null,
  loading: false,

  openCart: () => set({ isCartOpen: true }),
  closeCart: () => set({ isCartOpen: false }),
  toggleCart: () => set((state) => ({ isCartOpen: !state.isCartOpen })),

  openAppointmentModal: (pkg?: Package | null) => {
    // If a package is passed, select it; otherwise default to the first package in cart if available
    const chosen = pkg || (get().items.length > 0 ? get().items[0].package : null);
    set({
      isAppointmentModalOpen: true,
      selectedPackage: chosen,
      isCartOpen: false, // Close cart popup when modal opens
    });
  },

  closeAppointmentModal: () => set({ isAppointmentModalOpen: false }),

  addItem: async (pkg: Package, quantity = 1) => {
    // Kiểm tra đăng nhập: nếu chưa đăng nhập thì chỉ có thể xem, không thể thêm vào giỏ hàng
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    if (!token) {
      return false;
    }

    const currentItems = [...get().items];
    const existingIndex = currentItems.findIndex(
      (item) => item.package_id === pkg.id
    );

    const price = Number(pkg.discount_price ?? pkg.price);

    if (existingIndex > -1) {
      currentItems[existingIndex] = {
        ...currentItems[existingIndex],
        quantity: currentItems[existingIndex].quantity + quantity,
      };
    } else {
      currentItems.push({
        id: Date.now(),
        package_id: pkg.id,
        quantity,
        price,
        package: pkg,
      });
    }

    set({ items: currentItems, isCartOpen: true });
    saveItemsToLocal(currentItems);

    // Call API in background if logged in
    try {
      await addToCartAPI(pkg.id, quantity);
    } catch (err) {
      console.warn("Backend cart update failed, kept local state", err);
    }

    return true;
  },

  updateQuantity: async (packageId: number, quantity: number) => {
    // Không thể giảm xuống dưới 1, tối thiểu luôn là 1
    const finalQuantity = Math.max(1, quantity);

    const currentItems = get().items.map((item) =>
      item.package_id === packageId ? { ...item, quantity: finalQuantity } : item
    );

    set({ items: currentItems });
    saveItemsToLocal(currentItems);

    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    if (token) {
      try {
        await updateCartQuantityAPI(packageId, finalQuantity);
      } catch (err) {
        console.warn("Backend update quantity failed", err);
      }
    }
  },

  removeItem: async (packageId: number) => {
    const currentItems = get().items.filter(
      (item) => item.package_id !== packageId
    );

    set({ items: currentItems });
    saveItemsToLocal(currentItems);

    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    if (token) {
      try {
        await deleteCartItemAPI(packageId);
      } catch (err) {
        console.warn("Backend delete item failed", err);
      }
    }
  },

  clearCart: () => {
    set({ items: [] });
    saveItemsToLocal([]);
  },

  syncWithBackend: async () => {
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    if (!token) return;

    try {
      set({ loading: true });
      const cartData = await getCart();
      if (cartData && Array.isArray(cartData.cart_details)) {
        set({ items: cartData.cart_details });
        saveItemsToLocal(cartData.cart_details);
      }
    } catch {
      // Keep local state
    } finally {
      set({ loading: false });
    }
  },

  getTotalItems: () => {
    return get().items.reduce((acc, item) => acc + item.quantity, 0);
  },

  getTotalAmount: () => {
    return get().items.reduce((acc, item) => {
      const price = Number(item.price || item.package.discount_price || item.package.price || 0);
      return acc + price * item.quantity;
    }, 0);
  },
}));
