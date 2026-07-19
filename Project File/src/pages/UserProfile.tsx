import { useState, useEffect } from "react";
import { User, Order } from "../types";
import { User as UserIcon, Calendar, MapPin, Truck, AlertCircle } from "lucide-react";

interface UserProfileProps {
  currentUser: User | null;
  onLogout: () => void;
  onNavigate: (page: string) => void;
}

export default function UserProfile({ currentUser, onLogout, onNavigate }: UserProfileProps) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchOrders = () => {
    if (!currentUser) return;
    fetch(`/api/orders?userId=${currentUser._id}`)
      .then((res) => res.json())
      .then((data) => {
        setOrders(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error loading profile orders:", err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchOrders();
  }, [currentUser]);

  const handleCancelOrder = async (orderId: string) => {
    const confirmCancel = window.confirm("Are you sure you want to cancel this order?");
    if (!confirmCancel) return;

    try {
      const res = await fetch(`/api/orders/${orderId}/cancel`, {
        method: "PUT",
      });
      if (res.ok) {
        // Refresh orders list
        fetchOrders();
      } else {
        alert("Failed to cancel order.");
      }
    } catch (err) {
      console.error("Error cancelling order:", err);
    }
  };

  if (!currentUser) {
    return (
      <div className="max-w-md mx-auto text-center py-12 space-y-4">
        <p className="text-gray-500 font-medium">Please login to view your profile.</p>
        <button
          onClick={() => onNavigate("auth")}
          className="bg-indigo-600 text-white px-6 py-2 rounded-md font-bold text-sm"
        >
          Go to Login
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col md:flex-row gap-8 animate-fade-in pb-16">
      
      {/* Left Sidebar - User Card */}
      <div className="w-full md:w-80 shrink-0">
        <div className="bg-white border border-gray-100 p-6 rounded-xl shadow-sm space-y-6">
          <div className="flex flex-col items-center text-center space-y-3 pb-4 border-b border-gray-50">
            <div className="w-16 h-16 bg-indigo-100 text-indigo-700 rounded-full flex items-center justify-center">
              <UserIcon size={32} />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-gray-900">{currentUser.username}</h2>
              <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded font-bold uppercase tracking-wider mt-1 inline-block">
                {currentUser.usertype}
              </span>
            </div>
          </div>

          <div className="space-y-3.5 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-400 font-medium">Username:</span>
              <span className="font-bold text-gray-800">{currentUser.username}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400 font-medium">Email:</span>
              <span className="font-bold text-gray-800 max-w-[150px] truncate">{currentUser.email}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400 font-medium">Orders:</span>
              <span className="font-extrabold text-indigo-600">{orders.length}</span>
            </div>
          </div>

          <div className="pt-4 border-t border-gray-50">
            <button
              onClick={onLogout}
              className="w-full py-2.5 bg-red-600 hover:bg-red-700 text-white font-extrabold rounded-lg text-xs shadow-sm transition-colors"
              id="profile-logout-btn"
            >
              Logout
            </button>
          </div>
        </div>
      </div>

      {/* Right Column - Orders List */}
      <div className="flex-grow space-y-6">
        <h2 className="text-lg font-black text-gray-950 uppercase border-b border-gray-50 pb-3">
          My Order History
        </h2>

        {loading ? (
          <div className="space-y-4">
            {[1, 2].map((i) => (
              <div key={i} className="bg-gray-100 animate-pulse h-36 rounded-lg"></div>
            ))}
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-16 bg-gray-50 border border-dashed border-gray-200 rounded-lg max-w-lg mx-auto">
            <p className="text-gray-500 font-medium">You haven't placed any orders yet!</p>
            <button
              onClick={() => onNavigate("products")}
              className="mt-3 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-lg font-bold text-xs shadow-sm"
            >
              Explore Products
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => {
              const itemTotal = Math.round(order.price - (order.price * order.discount) / 100) * order.quantity;
              
              // Get color badge based on status
              const getStatusBadgeClass = (status: string) => {
                switch (status.toLowerCase()) {
                  case "delivered":
                    return "bg-emerald-50 text-emerald-700 border-emerald-200";
                  case "cancelled":
                    return "bg-red-50 text-red-600 border-red-200";
                  case "in-transit":
                    return "bg-amber-50 text-amber-700 border-amber-200";
                  default: // order placed
                    return "bg-blue-50 text-blue-700 border-blue-200";
                }
              };

              return (
                <div
                  key={order._id}
                  className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow duration-300 flex flex-col sm:flex-row gap-5"
                  id={`profile-order-item-${order._id}`}
                >
                  {/* Item Image */}
                  <div className="w-24 h-24 bg-gray-50 border border-gray-50 rounded-lg overflow-hidden shrink-0 flex items-center justify-center p-2">
                    <img
                      src={order.mainImg}
                      alt={order.title}
                      referrerPolicy="no-referrer"
                      className="object-contain max-h-full max-w-full"
                    />
                  </div>

                  {/* Order Details text */}
                  <div className="flex-grow flex flex-col justify-between space-y-3.5">
                    
                    <div className="space-y-1">
                      <h3 className="font-extrabold text-sm text-gray-950">{order.title}</h3>
                      <p className="text-xs text-gray-500 line-clamp-1">{order.description}</p>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-semibold text-gray-600">
                      <div>Size: <span className="text-gray-950">{order.size}</span></div>
                      <div>Quantity: <span className="text-gray-950">{order.quantity}</span></div>
                      <div>Price: <span className="text-gray-950">₹{itemTotal}</span></div>
                      <div>Payment: <span className="text-indigo-600 capitalize">{order.paymentMethod}</span></div>
                    </div>

                    <div className="space-y-1 bg-gray-50 border border-gray-50 p-2.5 rounded text-xs text-gray-500">
                      <div className="flex items-center gap-1.5">
                        <MapPin size={13} className="text-indigo-500" />
                        <span>Address: <strong className="text-gray-700">{order.address}</strong> (Pincode: {order.pincode})</span>
                      </div>
                      <div className="flex items-center gap-4 mt-1">
                        <div className="flex items-center gap-1">
                          <Calendar size={13} />
                          <span>Ordered: {order.orderDate}</span>
                        </div>
                        {order.orderStatus.toLowerCase() !== "cancelled" && (
                          <div className="flex items-center gap-1 text-emerald-600">
                            <Truck size={13} />
                            <span>Estimated Delivery: {order.deliveryDate}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Footer Status and Actions */}
                    <div className="flex items-center justify-between gap-4 pt-2 border-t border-gray-50">
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-400 font-bold uppercase tracking-wider">Status:</span>
                        <span className={`text-[11px] font-extrabold px-2.5 py-0.5 rounded border ${getStatusBadgeClass(order.orderStatus)}`}>
                          {order.orderStatus}
                        </span>
                      </div>

                      {/* Cancel button if order status is 'order placed' */}
                      {order.orderStatus === "order placed" && (
                        <button
                          onClick={() => handleCancelOrder(order._id)}
                          className="px-4 py-1.5 bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 hover:border-red-300 font-bold rounded-md text-xs transition-colors"
                        >
                          Cancel
                        </button>
                      )}
                    </div>

                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

    </div>
  );
}
