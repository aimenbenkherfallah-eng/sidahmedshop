import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import api from '../api/client';
import { initPixels, trackAddToCart } from '../utils/pixels';
import { useLanguage } from './LanguageContext';

const StoreContext = createContext(null);
const CART_KEY = 'sas_cart';

const loadCart = () => {
  try {
    return JSON.parse(localStorage.getItem(CART_KEY)) || [];
  } catch {
    return [];
  }
};

export function StoreProvider({ children }) {
  const { t } = useLanguage();
  const [cart, setCart] = useState(loadCart);
  const [settings, setSettings] = useState(null);
  const [cartOpen, setCartOpen] = useState(false);
  const [toasts, setToasts] = useState([]);

  const refreshSettings = useCallback(() =>
    api
      .get('/api/settings/public')
      .then((res) => {
        setSettings(res.data.settings);
        initPixels(res.data.settings);
        return res.data.settings;
      })
  , []);

  useEffect(() => {
    refreshSettings().catch(() => {});
  }, [refreshSettings]);

  useEffect(() => {
    try {
      localStorage.setItem(CART_KEY, JSON.stringify(cart));
    } catch {
      /* ignore */
    }
  }, [cart]);

  const settingsLoading = settings === null;
  const cartEnabled = settings?.shoppingCart?.enabled !== false;

  useEffect(() => {
    if (!settings || cartEnabled) return;
    setCart([]);
    setCartOpen(false);
  }, [settings, cartEnabled]);

  const showToast = useCallback((message, type = 'success') => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 3500);
  }, []);

  const cartCount = useMemo(() => cart.reduce((s, i) => s + i.quantity, 0), [cart]);
  const cartSubtotal = useMemo(
    () => cart.reduce((s, i) => s + i.price * i.quantity, 0),
    [cart]
  );

  const addToCart = useCallback(
    (product, quantity = 1) => {
      if (!cartEnabled) return false;
      setCart((prev) => {
        const existing = prev.find((i) => i.productId === product._id);
        if (existing) {
          return prev.map((i) =>
            i.productId === product._id ? { ...i, quantity: Math.min(i.quantity + quantity, i.stock) } : i
          );
        }
        return [
          ...prev,
          {
            productId: product._id,
            slug: product.slug,
            title: product.title,
            titleAr: product.titleAr || product.title,
            price: product.discountedPrice ?? product.price,
            originalPrice: product.price,
            image: product.images?.[0] || '',
            stock: product.stock,
            quantity,
          },
        ];
      });
      trackAddToCart({ product, quantity });
      showToast(t.cart.itemAdded);
      setCartOpen(true);
      return true;
    },
    [cartEnabled, showToast, t]
  );

  const updateQuantity = useCallback((productId, quantity) => {
    setCart((prev) =>
      prev
        .map((i) =>
          i.productId === productId ? { ...i, quantity: Math.max(1, Math.min(quantity, i.stock)) } : i
        )
        .filter((i) => i.quantity > 0)
    );
  }, []);

  const removeFromCart = useCallback((productId) => {
    setCart((prev) => prev.filter((i) => i.productId !== productId));
  }, []);

  const clearCart = useCallback(() => setCart([]), []);

  const shippingFeeFor = useCallback(
    (wilaya) => {
      if (!settings || !wilaya) return null;
      return settings.shippingFees?.[String(wilaya)] ?? settings.defaultShippingFee ?? 0;
    },
    [settings]
  );

  const value = useMemo(
    () => ({
      cart,
      settings,
      settingsLoading,
      cartEnabled,
      cartOpen,
      setCartOpen,
      toasts,
      showToast,
      cartCount,
      cartSubtotal,
      addToCart,
      updateQuantity,
      removeFromCart,
      clearCart,
      shippingFeeFor,
      refreshSettings,
    }),
    [cart, settings, settingsLoading, cartEnabled, cartOpen, toasts, showToast, cartCount, cartSubtotal, addToCart, updateQuantity, removeFromCart, clearCart, shippingFeeFor, refreshSettings]
  );

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export const useStore = () => {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error('useStore must be used within StoreProvider');
  return ctx;
};
