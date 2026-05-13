import CartClient from "../../components/CartClient";

export default function CartPage() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <div className="mx-auto max-w-7xl px-6 py-20">
        <CartClient />
      </div>
    </div>
  );
}
