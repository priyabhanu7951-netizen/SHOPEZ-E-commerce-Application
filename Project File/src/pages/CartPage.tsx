import React, { useState, useEffect } from "react";
import { User, CartItem } from "../types";
import { ShoppingBag, ArrowRight, Trash2, MapPin, CreditCard, Check } from "lucide-react";

interface CartPageProps {
  currentUser: User | null;
  onNavigate: (page: string) => void;
  onRefreshCartCount: () => void;
}

export default function CartPage({ currentUser, onNavigate, onRefreshCartCount }: CartPageProps) {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Checkout states inside cart
  const [showCheckoutForm, setShowCheckoutForm] = useState(false);
  const [shippingName, setShippingName] = useState(currentUser?.username || "");
  const [shippingEmail, setShippingEmail] = useState(currentUser?.email || "");
  const [shippingMobile, setShippingMobile] = useState("");
  const [shippingAddress, setShippingAddress] = useState("");
  const [shippingPincode, setShippingPincode] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("netbanking");

  const [orderSuccess, setOrderSuccess] = useState(false);
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const fetchCartItems = () => {
    if (!currentUser) return;
    fetch(`/api/cart?userId=${currentUser._id}`)
      .then((res) => res.json())
      .then((data) => {
        setCartItems(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error loading cart:", err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchCartItems();
  }, [currentUser]);

  const handleRemoveItem = async (itemId: string) => {
    try {
      const res = await fetch(`/api/cart/${itemId}`, {
        method: "DELETE",
      });
      if (res.ok) {
        fetchCartItems();
        onRefreshCartCount();
      } else {
        alert("Could not remove item.");
      }
    } catch (err) {
      console.error("Error removing cart item:", err);
    }
  };

  // Price calculations
  const totalMRP = cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const totalDiscount = cartItems.reduce((acc, item) => {
    const discAmt = (item.price * item.discount) / 100;
    return acc + discAmt * item.quantity;
  }, 0);
  const deliveryCharges = 0; // Free delivery as in screenshots
  const finalPrice = Math.round(totalMRP - totalDiscount + deliveryCharges);

  const handlePlaceOrderSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!shippingName || !shippingEmail || !shippingMobile || !shippingAddress || !shippingPincode) {
      setErrorMsg("Please fill out all shipping details!");
      return;
    }
    setErrorMsg("");
    setIsPlacingOrder(true);

    const orderPayload = {
      userId: currentUser?._id,
      name: shippingName,
      email: shippingEmail,
      mobile: shippingMobile,
      address: shippingAddress,
      pincode: shippingPincode,
      paymentMethod,
      items: cartItems.map((item) => ({
        title: item.title,
        description: item.description,
        mainImg: item.mainImg,
        size: item.size,
        quantity: item.quantity,
        price: item.price,
        discount: item.discount,
      })),
    };

    try {
      // 1. Create orders
      const resOrder = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orderPayload),
      });

      if (!resOrder.ok) {
        const errData = await resOrder.json();
        throw new Error(errData.error || "Failed to place orders");
      }

      // 2. Clear user cart
      const resClear = await fetch(`/api/cart?userId=${currentUser?._id}`, {
        method: "DELETE",
      });

      if (resClear.ok) {
        onRefreshCartCount();
        setOrderSuccess(true);
        setCartItems([]);
      }
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || "An error occurred during checkout.");
    } finally {
      setIsPlacingOrder(false);
    }
  };

  if (!currentUser) {
    return (
      <div className="max-w-md mx-auto text-center py-16 space-y-4">
        <p className="text-gray-500 font-medium">Please login to access your shopping cart.</p>
        <button
          onClick={() => onNavigate("auth")}
          className="bg-indigo-600 text-white px-6 py-2.5 rounded-lg font-bold text-xs"
        >
          Go to Login
        </button>
      </div>
    );
  }

  if (orderSuccess) {
    return (
      <div className="max-w-xl mx-auto text-center bg-emerald-50 border border-emerald-200 p-8 rounded-xl space-y-6 animate-scale-up">
        <div className="mx-auto w-12 h-12 bg-emerald-500 text-white rounded-full flex items-center justify-center">
          <Check size={28} />
        </div>
        <div className="space-y-2">
          <h2 className="text-xl md:text-2xl font-black text-emerald-950 uppercase">Order Placed Successfully!</h2>
          <p className="text-sm text-emerald-800 font-medium">
            Your cart has been cleared and orders are recorded. You can manage them in your profile.
          </p>
        </div>
        <div className="flex justify-center gap-4 pt-2">
          <button
            onClick={() => onNavigate("profile")}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold py-2 px-6 rounded-md text-xs shadow-sm transition-all"
          >
            Go to Profile
          </button>
          <button
            onClick={() => onNavigate("products")}
            className="bg-white border border-gray-200 text-gray-700 font-extrabold py-2 px-6 rounded-md text-xs shadow-sm hover:bg-gray-50 transition-all"
          >
            Continue Shopping
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in pb-20">
      <h2 className="text-xl font-black text-gray-950 uppercase border-b border-gray-50 pb-3">
        My Shopping Cart
      </h2>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-2 space-y-4">
            <div className="bg-gray-100 animate-pulse h-28 rounded-lg"></div>
            <div className="bg-gray-100 animate-pulse h-28 rounded-lg"></div>
          </div>
          <div className="bg-gray-100 animate-pulse h-48 rounded-lg"></div>
        </div>
      ) : cartItems.length === 0 ? (
        <div className="text-center py-16 bg-gray-50 border border-dashed border-gray-200 rounded-lg max-w-lg mx-auto">
          <p className="text-gray-500 font-medium">Your cart is currently empty!</p>
          <button
            onClick={() => onNavigate("products")}
            className="mt-3 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2.5 rounded-lg font-bold text-xs shadow-sm"
          >
            Find Products
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
          
          {/* Left Side: Cart Items List */}
          <div className="md:col-span-2 space-y-4">
            <div className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm space-y-4">
              {cartItems.map((item) => {
                const discAmt = (item.price * item.discount) / 100;
                const discPrice = Math.round(item.price - discAmt);

                return (
                  <div
                    key={item._id}
                    className="flex flex-col sm:flex-row gap-4 py-4 border-b border-gray-50 last:border-0 last:pb-0"
                    id={`cart-item-${item._id}`}
                  >
                    {/* Item Img */}
                    <div className="w-20 h-20 bg-gray-50 border border-gray-50 rounded-lg overflow-hidden flex items-center justify-center p-1.5 shrink-0">
                      <img
                        src={item.mainImg}
                        alt={item.title}
                        referrerPolicy="no-referrer"
                        className="object-contain max-h-full max-w-full"
                      />
                    </div>

                    {/* Details */}
                    <div className="flex-grow flex flex-col justify-between py-0.5">
                      <div>
                        <h4 className="text-sm font-extrabold text-gray-900">{item.title}</h4>
                        <p className="text-xs text-gray-500 line-clamp-1 mt-0.5">{item.description}</p>
                        <div className="flex gap-4 text-xs font-semibold text-gray-400 mt-2">
                          <span>Size: <strong className="text-gray-700">{item.size}</strong></span>
                          <span>Quantity: <strong className="text-gray-700">{item.quantity}</strong></span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between gap-4 mt-3">
                        {/* Price */}
                        <div className="flex items-baseline gap-2 text-sm">
                          <span className="font-extrabold text-gray-900">₹{discPrice}</span>
                          {item.discount > 0 && (
                            <span className="text-xs text-gray-400 line-through font-medium">₹{item.price}</span>
                          )}
                        </div>

                        {/* Remove button */}
                        <button
                          onClick={() => handleRemoveItem(item._id)}
                          className="text-xs text-red-500 hover:text-red-700 font-bold flex items-center gap-1 hover:underline cursor-pointer"
                        >
                          <Trash2 size={13} />
                          Remove
                        </button>
                      </div>

                    </div>
                  </div>
                );
              })}
            </div>

            {/* Expansible Checkout Address Form */}
            {showCheckoutForm && (
              <div className="bg-white border border-indigo-50 p-6 rounded-xl shadow-md space-y-4 animate-slide-up">
                <div className="border-b border-gray-50 pb-2 flex items-center gap-2 text-indigo-900">
                  <MapPin size={18} />
                  <h3 className="font-extrabold text-sm uppercase tracking-wider">
                    Shipping Address & Delivery Info
                  </h3>
                </div>

                {errorMsg && (
                  <div className="bg-red-50 text-red-700 text-xs font-semibold p-3.5 rounded">
                    {errorMsg}
                  </div>
                )}

                <form onSubmit={handlePlaceOrderSubmit} className="space-y-4 text-xs">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="font-bold text-gray-600">Full Shipping Name</label>
                      <input
                        type="text"
                        required
                        className="w-full border border-gray-200 rounded p-2 text-xs focus:ring-1 focus:ring-indigo-500"
                        value={shippingName}
                        onChange={(e) => setShippingName(e.target.value)}
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="font-bold text-gray-600">Email Address</label>
                      <input
                        type="email"
                        required
                        className="w-full border border-gray-200 rounded p-2 text-xs focus:ring-1 focus:ring-indigo-500"
                        value={shippingEmail}
                        onChange={(e) => setShippingEmail(e.target.value)}
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="font-bold text-gray-600">Mobile Number</label>
                      <input
                        type="tel"
                        required
                        placeholder="e.g. 8798790898"
                        className="w-full border border-gray-200 rounded p-2 text-xs focus:ring-1 focus:ring-indigo-500"
                        value={shippingMobile}
                        onChange={(e) => setShippingMobile(e.target.value)}
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="font-bold text-gray-600">Area Pincode</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. 502132"
                        className="w-full border border-gray-200 rounded p-2 text-xs focus:ring-1 focus:ring-indigo-500"
                        value={shippingPincode}
                        onChange={(e) => setShippingPincode(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-gray-600">Detailed Address</label>
                    <textarea
                      required
                      rows={2}
                      placeholder="Street name, landmark, town (e.g. Vizag)"
                      className="w-full border border-gray-200 rounded p-2 text-xs focus:ring-1 focus:ring-indigo-500"
                      value={shippingAddress}
                      onChange={(e) => setShippingAddress(e.target.value)}
                    />
                  </div>

                  {/* Payment */}
                  <div className="space-y-1">
                    <label className="font-bold text-gray-600 block mb-1">Select Payment Method</label>
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { id: "netbanking", label: "Netbanking" },
                        { id: "card", label: "Card" },
                        { id: "cod", label: "COD" },
                      ].map((pm) => (
                        <label
                          key={pm.id}
                          className={`flex items-center gap-1.5 border p-2 rounded cursor-pointer transition-colors ${
                            paymentMethod === pm.id ? "bg-indigo-50 border-indigo-500 font-bold text-indigo-900" : "bg-white text-gray-500 hover:bg-gray-50"
                          }`}
                        >
                          <input
                            type="radio"
                            name="cartPayment"
                            checked={paymentMethod === pm.id}
                            onChange={() => setPaymentMethod(pm.id)}
                          />
                          <span>{pm.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div className="flex justify-end gap-2 pt-2 border-t border-gray-50">
                    <button
                      type="button"
                      onClick={() => setShowCheckoutForm(false)}
                      className="py-1.5 px-4 border border-gray-200 text-gray-700 font-bold rounded"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isPlacingOrder}
                      className="py-1.5 px-6 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold rounded shadow"
                    >
                      {isPlacingOrder ? "Placing..." : `Authorize Purchase (₹${finalPrice})`}
                    </button>
                  </div>
                </form>
              </div>
            )}

          </div>

          {/* Right Side: Price Details Summary Card */}
          <div className="space-y-4">
            <div className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm space-y-4" id="cart-price-details-card">
              <h3 className="text-xs font-extrabold text-gray-400 tracking-wider uppercase border-b border-gray-50 pb-2">
                Price Details
              </h3>

              <div className="space-y-3 text-sm">
                <div className="flex justify-between text-gray-600">
                  <span>Total MRP:</span>
                  <span className="font-semibold text-gray-800">₹{totalMRP}</span>
                </div>
                
                <div className="flex justify-between text-gray-600">
                  <span>Discount on MRP:</span>
                  <span className="font-semibold text-red-600">- ₹{Math.round(totalDiscount)}</span>
                </div>

                <div className="flex justify-between text-gray-600">
                  <span>Delivery Charges:</span>
                  <span className="font-semibold text-emerald-600">+ ₹{deliveryCharges} (Free)</span>
                </div>

                <div className="pt-3 border-t border-gray-50 flex justify-between font-extrabold text-base text-gray-900">
                  <span>Final Price:</span>
                  <span>₹{finalPrice}</span>
                </div>
              </div>

              {!showCheckoutForm && (
                <div className="pt-2">
                  <button
                    onClick={() => setShowCheckoutForm(true)}
                    className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold rounded-lg text-xs shadow-md flex items-center justify-center gap-2 group transition-all"
                    id="place-order-cart-btn"
                  >
                    Place order
                    <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
              )}
            </div>
          </div>

        </div>
      )}

    </div>
  );
}
