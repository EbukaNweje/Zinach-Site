import { getSessionId } from "./session";

export type CartItem = {
  productId: string;
  slug: string;
  name: string;
  brand?: string;
  price: string;
  image?: string;
  packageOption?: string;
  quantity: number;
};

function headers() {
  return {
    "Content-Type": "application/json",
    "x-session-id": getSessionId(),
  };
}

export async function fetchCart(): Promise<CartItem[]> {
  const res = await fetch("/api/cart", {
    headers: { "x-session-id": getSessionId() },
    cache: "no-store",
  });
  const data = await res.json();
  return data.success ? data.data : [];
}

export async function addToCart(
  item: Omit<CartItem, "quantity"> & { quantity?: number },
): Promise<CartItem[]> {
  const res = await fetch("/api/cart/add", {
    method: "POST",
    headers: headers(),
    body: JSON.stringify({ ...item, quantity: item.quantity ?? 1 }),
  });
  const data = await res.json();
  return data.success ? data.data : [];
}

export async function removeFromCart(
  slug: string,
  packageOption = "",
): Promise<CartItem[]> {
  const res = await fetch("/api/cart/remove", {
    method: "DELETE",
    headers: headers(),
    body: JSON.stringify({ slug, packageOption }),
  });
  const data = await res.json();
  return data.success ? data.data : [];
}

export async function updateCartQuantity(
  slug: string,
  quantity: number,
  packageOption = "",
): Promise<CartItem[]> {
  const res = await fetch("/api/cart/update", {
    method: "PATCH",
    headers: headers(),
    body: JSON.stringify({ slug, quantity, packageOption }),
  });
  const data = await res.json();
  return data.success ? data.data : [];
}

export async function clearCart(): Promise<void> {
  await fetch("/api/cart/clear", {
    method: "DELETE",
    headers: headers(),
  });
}
