import React, { useState } from "react";
import { ArrowLeft, ShoppingBag, CreditCard, ChevronRight, Check } from "lucide-react";
import { Product, User } from "../types";

interface ProductDetailPageProps {
  product: Product;
  currentUser: User | null;
  onBack: () => void;
  onAddToCart: (product: Product, size: string, quantity: number) => void;
  onNavigate: (page: string) => void;
}

export default function ProductDetailPage({
  product,
  currentUser,
  onBack,
  onAddToCart,
  onNavigate,
}: ProductDetailPageProps) {
  const [selectedSize, setSelectedSize] = useState<string>(product.sizes[0] || "Standard");
  const [quantity, setQuantity] = useState<number>(1);
  const [activeImg, setActiveImg] = useState<string>(product.mainImg);

  // Checkout states
  const [showCheckoutForm, setShowCheckoutForm] = useState(false);
  const [shippingName, setShippingName] = useState(currentUser?.username || "");
  const [shippingEmail, setShippingEmail] = useState(currentUser?.email || "");
  const [shippingMobile, setShippingMobile] = useState("");
  const [shippingAddress, setShippingAddress] = useState("");
  const [shippingPincode, setShippingPincode] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("netbanking");

  const [orderSuccess, setOrderSuccess] = useState(false);
  const [lastPlacedOrder, setLastPlacedOrder] = useState<any>(null);
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const discountAmount = (product.price * product.discount) / 100;
  const unitDiscountedPrice = Math.round(product.price - discountAmount);
  const totalAmount = unitDiscountedPrice * quantity;

  // List of images for carousel (MainImg + carousel items)
  const allImages = [product.mainImg, ...(product.carousel || [])].filter(Boolean);

  const handleAddToCartClick = () => {
    onAddToCart(product, selectedSize, quantity);
  };

  const handleBuyNowClick = () => {
    if (!currentUser) {
      alert("Please log in to initiate the purchasing process!");
      onNavigate("auth");
      return;
    }
    setShowCheckoutForm(true);
    // Smooth scroll to form
    setTimeout(() => {
      document.getElementById("checkout-form-section")?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  };

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
      items: [
        {
          title: product.title,
          description: product.description,
          mainImg: product.mainImg,
          size: selectedSize,
          quantity,
          price: product.price,
          discount: product.discount,
        },
      ],
    };

    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orderPayload),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Order failed");
      }

      const placedOrders = await res.json();
      setLastPlacedOrder(placedOrders[0]);
      setOrderSuccess(true);
      setShowCheckoutForm(false);
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || "An error occurred while placing your order.");
    } finally {
      setIsPlacingOrder(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fade-in pb-20">
      
      {/* Navigation Breadcrumbs */}
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-sm font-semibold text-gray-500 hover:text-indigo-600 transition-colors group"
      >
        <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
        Back to Products
      </button>

      {orderSuccess && lastPlacedOrder ? (
        /* Order Confirmation Box */
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-6 md:p-8 space-y-6 text-center animate-scale-up" id="order-success-banner">
          <div className="mx-auto w-12 h-12 bg-emerald-500 rounded-full flex items-center justify-center text-white mb-3">
            <Check size={28} />
          </div>
          <div className="space-y-2">
            <h2 className="text-xl md:text-2xl font-black text-emerald-950 uppercase">Order Confirmed!</h2>
            <p className="text-sm text-emerald-800 font-medium">
              Thank you for shopping with ShopEZ! Your order has been placed successfully.
            </p>
          </div>

          <div className="max-w-md mx-auto bg-white border border-emerald-100 rounded-lg p-5 text-left shadow-sm space-y-3 text-sm">
            <div className="flex justify-between border-b border-gray-50 pb-2">
              <span className="font-bold text-gray-900">{lastPlacedOrder.title}</span>
              <span className="font-semibold text-gray-500">Qty: {lastPlacedOrder.quantity}</span>
            </div>
            <div className="space-y-1 text-xs text-gray-600">
              <p><strong>Order ID:</strong> {lastPlacedOrder._id}</p>
              <p><strong>Shipping Address:</strong> {lastPlacedOrder.address}, {lastPlacedOrder.pincode}</p>
              <p><strong>Payment Method:</strong> {lastPlacedOrder.paymentMethod}</p>
              <p><strong>Delivery Estimate:</strong> {lastPlacedOrder.deliveryDate}</p>
            </div>
            <div className="pt-2 border-t border-gray-50 flex justify-between font-bold text-sm text-gray-900">
              <span>Total Price:</span>
              <span>₹{totalAmount}</span>
            </div>
          </div>

          <div className="flex justify-center gap-4 pt-2">
            <button
              onClick={() => onNavigate("profile")}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-6 rounded-md text-sm shadow-sm transition-all"
            >
              Check Orders in Profile
            </button>
            <button
              onClick={onBack}
              className="bg-white hover:bg-gray-50 border border-gray-200 text-gray-700 font-bold py-2 px-6 rounded-md text-sm shadow-sm transition-all"
            >
              Continue Shopping
            </button>
          </div>
        </div>
      ) : (
        /* Main Product Detail View */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 bg-white border border-gray-100 p-6 md:p-8 rounded-xl shadow-sm">
          
          {/* Images Section */}
          <div className="space-y-4">
            <div className="aspect-square bg-gray-50 border border-gray-50 rounded-lg overflow-hidden flex items-center justify-center p-4">
              <img
                src={activeImg}
                alt={product.title}
                referrerPolicy="no-referrer"
                className="object-contain max-h-full max-w-full transition-transform duration-300"
              />
            </div>
            {allImages.length > 1 && (
              <div className="flex gap-2.5 overflow-x-auto pb-1">
                {allImages.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveImg(img)}
                    className={`w-16 h-16 bg-gray-50 border rounded-md p-1 overflow-hidden flex items-center justify-center shrink-0 transition-all ${
                      activeImg === img ? "border-indigo-600 ring-2 ring-indigo-100" : "border-gray-200 hover:border-indigo-400"
                    }`}
                  >
                    <img src={img} alt="thumbnail" referrerPolicy="no-referrer" className="object-contain max-h-full max-w-full" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Details Section */}
          <div className="flex flex-col justify-between space-y-6">
            
            <div className="space-y-3">
              <span className="bg-indigo-50 text-indigo-700 text-xs font-bold uppercase tracking-widest px-2.5 py-1 rounded">
                {product.category}
              </span>
              <h1 className="text-xl md:text-2xl font-black text-gray-950 tracking-tight leading-tight">
                {product.title}
              </h1>
              <p className="text-sm text-gray-600 leading-relaxed">
                {product.description}
              </p>
            </div>

            {/* Price Tag */}
            <div className="bg-gray-50 border border-gray-100 p-4 rounded-lg">
              <div className="flex items-baseline gap-2.5">
                <span className="text-2xl font-black text-gray-950">₹{unitDiscountedPrice}</span>
                {product.discount > 0 && (
                  <>
                    <span className="text-sm text-gray-400 line-through font-medium">₹{product.price}</span>
                    <span className="text-sm text-red-500 font-extrabold bg-red-50 px-1.5 py-0.5 rounded">
                      ({product.discount}% off)
                    </span>
                  </>
                )}
              </div>
              <span className="text-xs text-gray-400 block mt-1 font-medium">Includes all local taxes and service dues.</span>
            </div>

            {/* Size selection */}
            {product.sizes && product.sizes.length > 0 && (
              <div className="space-y-2">
                <span className="text-xs font-bold text-gray-400 uppercase tracking-wide">Select Size</span>
                <div className="flex flex-wrap gap-2">
                  {product.sizes.map((sz) => (
                    <button
                      key={sz}
                      onClick={() => setSelectedSize(sz)}
                      className={`py-1.5 px-4 rounded border text-sm font-semibold transition-all ${
                        selectedSize === sz
                          ? "bg-indigo-600 border-indigo-600 text-white shadow-sm"
                          : "bg-white border-gray-200 text-gray-700 hover:border-indigo-400"
                      }`}
                    >
                      {sz}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity Selector */}
            <div className="space-y-2">
              <span className="text-xs font-bold text-gray-400 uppercase tracking-wide">Select Quantity</span>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="w-8 h-8 rounded border border-gray-200 bg-white hover:bg-gray-50 text-gray-600 font-bold flex items-center justify-center transition-colors"
                >
                  -
                </button>
                <span className="w-10 text-center font-bold text-sm text-gray-900">{quantity}</span>
                <button
                  onClick={() => setQuantity((q) => Math.min(10, q + 1))}
                  className="w-8 h-8 rounded border border-gray-200 bg-white hover:bg-gray-50 text-gray-600 font-bold flex items-center justify-center transition-colors"
                >
                  +
                </button>
              </div>
            </div>

            {/* Actions Panel */}
            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-50">
              <button
                onClick={handleAddToCartClick}
                className="w-full py-3 px-4 bg-white border border-gray-200 text-gray-800 font-bold rounded-lg text-xs hover:bg-gray-50 transition-all shadow-sm flex items-center justify-center gap-2 hover:border-indigo-500"
                id="add-to-cart-btn"
              >
                <ShoppingBag size={15} />
                Add to Cart
              </button>
              <button
                onClick={handleBuyNowClick}
                className="w-full py-3 px-4 bg-indigo-600 text-white font-bold rounded-lg text-xs hover:bg-indigo-700 transition-all shadow-md flex items-center justify-center gap-2"
                id="buy-now-btn"
              >
                <CreditCard size={15} />
                Buy Now
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Accordion Direct Checkout Form (Revealed when Buy Now clicked) */}
      {showCheckoutForm && !orderSuccess && (
        <div
          id="checkout-form-section"
          className="bg-white border border-indigo-100 rounded-xl p-6 md:p-8 shadow-md space-y-6 animate-slide-up"
        >
          <div className="border-b border-gray-50 pb-3">
            <h3 className="text-base font-extrabold text-gray-900 tracking-tight">
              Initiate Secure Purchasing
            </h3>
            <p className="text-xs text-gray-500 mt-1">Please provide shipping address and select payment details.</p>
          </div>

          {errorMsg && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-xs font-semibold p-3.5 rounded-md">
              {errorMsg}
            </div>
          )}

          <form onSubmit={handlePlaceOrderSubmit} className="space-y-6">
            
            {/* Input fields */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-600">Full Shipping Name</label>
                <input
                  type="text"
                  required
                  className="w-full border border-gray-200 rounded-md p-2 text-sm focus:ring-2 focus:ring-indigo-300 focus:outline-none"
                  value={shippingName}
                  onChange={(e) => setShippingName(e.target.value)}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-600">Email Address</label>
                <input
                  type="email"
                  required
                  className="w-full border border-gray-200 rounded-md p-2 text-sm focus:ring-2 focus:ring-indigo-300 focus:outline-none"
                  value={shippingEmail}
                  onChange={(e) => setShippingEmail(e.target.value)}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-600">Mobile Number</label>
                <input
                  type="tel"
                  required
                  placeholder="e.g. 8798790898"
                  className="w-full border border-gray-200 rounded-md p-2 text-sm focus:ring-2 focus:ring-indigo-300 focus:outline-none"
                  value={shippingMobile}
                  onChange={(e) => setShippingMobile(e.target.value)}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-600">Area Pincode</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 502132"
                  className="w-full border border-gray-200 rounded-md p-2 text-sm focus:ring-2 focus:ring-indigo-300 focus:outline-none"
                  value={shippingPincode}
                  onChange={(e) => setShippingPincode(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-600">Detailed Shipping Address</label>
              <textarea
                required
                rows={3}
                placeholder="Enter complete building name, street address, and city (e.g. Vizag)"
                className="w-full border border-gray-200 rounded-md p-2 text-sm focus:ring-2 focus:ring-indigo-300 focus:outline-none"
                value={shippingAddress}
                onChange={(e) => setShippingAddress(e.target.value)}
              />
            </div>

            {/* Payment options */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-600 uppercase tracking-wide block">Preferred Payment Method</label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {[
                  { id: "netbanking", label: "Netbanking / UPI" },
                  { id: "card", label: "Credit/Debit Card" },
                  { id: "cod", label: "Cash on Delivery" },
                ].map((pm) => (
                  <label
                    key={pm.id}
                    className={`flex items-center gap-2.5 border p-3 rounded-lg text-sm font-semibold cursor-pointer select-none transition-colors ${
                      paymentMethod === pm.id ? "bg-indigo-50 border-indigo-500 text-indigo-900" : "bg-white border-gray-200 text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    <input
                      type="radio"
                      name="paymentMethod"
                      checked={paymentMethod === pm.id}
                      onChange={() => setPaymentMethod(pm.id)}
                      className="w-4 h-4 text-indigo-600 focus:ring-indigo-500 border-gray-300"
                    />
                    <span>{pm.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Total summary info */}
            <div className="bg-indigo-50/50 border border-indigo-100 rounded-lg p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-sm">
              <div>
                <span className="font-semibold text-gray-700">Order Summary:</span>
                <span className="text-xs text-gray-500 block">
                  {product.title} (Qty: {quantity}) @ size {selectedSize}
                </span>
              </div>
              <div className="text-right sm:text-right">
                <span className="text-gray-500">Amount Due:</span>
                <span className="text-lg font-extrabold text-indigo-900 block">₹{totalAmount}</span>
              </div>
            </div>

            {/* Button */}
            <div className="flex justify-end gap-3 pt-3 border-t border-gray-50">
              <button
                type="button"
                onClick={() => setShowCheckoutForm(false)}
                className="py-2.5 px-6 border border-gray-200 rounded-lg font-bold text-sm text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isPlacingOrder}
                className="py-2.5 px-8 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold rounded-lg text-sm shadow-md hover:shadow-lg transition-all disabled:opacity-50"
                id="place-order-submit-btn"
              >
                {isPlacingOrder ? "Placing Order..." : `Place Order (₹${totalAmount})`}
              </button>
            </div>

          </form>
        </div>
      )}

    </div>
  );
}
