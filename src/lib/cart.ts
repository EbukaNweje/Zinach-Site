export type CartItem = {
  slug: string;
  quantity: number;
};

const STORAGE_KEY = "dr-william-makis-cart";

export function getCart(): CartItem[] {
  if (typeof window === "undefined") return [];
  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw) as CartItem[];
    return Array.isArray(parsed)
      ? parsed.map((item) => ({
          slug: item.slug,
          quantity: typeof item.quantity === "number" ? item.quantity : 1,
        }))
      : [];
  } catch {
    return [];
  }
}

export function saveCart(items: CartItem[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

export function addToCart(slug: string) {
  const cart = getCart();
  const existing = cart.find((item) => item.slug === slug);
  if (existing) {
    existing.quantity += 1;
  } else {
    cart.push({ slug, quantity: 1 });
  }
  saveCart(cart);
}

export function removeFromCart(slug: string) {
  const cart = getCart().filter((item) => item.slug !== slug);
  saveCart(cart);
}

export function updateCartQuantity(slug: string, quantity: number) {
  const cart = getCart().map((item) =>
    item.slug === slug ? { ...item, quantity: Math.max(0, quantity) } : item,
  );
  saveCart(cart.filter((item) => item.quantity > 0));
}

export function clearCart() {
  saveCart([]);
}
