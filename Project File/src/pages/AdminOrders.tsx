import { useState, useEffect } from "react";
import { Order } from "../types";
import { User, ClipboardList, MapPin, Truck, AlertTriangle, Check } from "lucide-react";

export default function AdminOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Local state to track status dropdown value for each order
  const [localStatuses, setLocalStatuses] = useState<Record<string, string>>({});

  const fetchAllOrders = () => {
    fetch("/api/orders")
      .then((res) => res.json())
      .then((data) => {
        setOrders(data);
        // Initialize dropdown states
        const statuses: Record<string, string> = {};
        data.forEach((o: Order) => {
          statuses[o._id] = o.orderStatus;
        });
        setLocalStatuses(statuses);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error loading admin orders:", err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchAllOrders();
  }, []);

  const handleStatusChange = (orderId: string, status: string) => {
    setLocalStatuses((prev) => ({
      ...prev,
      [orderId]: status,
    }));
  };

  const handleUpdateStatusSubmit = async (orderId: string) => {
    const newStatus = localStatuses[orderId];
    try {
      const res = await fetch(`/api/orders/${orderId}/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        alert(`Order status updated successfully to "${newStatus}"!`);
        fetchAllOrders();
      } else {
        alert("Failed to update status.");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleCancelClick = async (orderId: string) => {
    const confirmCancel = window.confirm("Are you sure you want to cancel this order?");
    if (!confirmCancel) return;

    try {
      const res = await fetch(`/api/orders/${orderId}/cancel`, {
        method: "PUT",
      });
      if (res.ok) {
        fetchAllOrders();
      } else {
        alert("Failed to cancel order.");
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in pb-16">
      
      {/* Header */}
      <div className="border-b border-gray-50 pb-3">
        <h2 className="text-xl font-black text-gray-900 tracking-tight">
          Manage Customer Orders
        </h2>
        <p className="text-xs text-gray-400 mt-1">Review checkout requests, track shipments, and dispatch parcel deliveries.</p>
      </div>

      {loading ? (
        <div className="text-gray-400 animate-pulse font-medium">Fetching orders queue...</div>
      ) : orders.length === 0 ? (
        <div className="text-center py-16 bg-gray-50 border border-dashed border-gray-200 rounded-lg max-w-lg mx-auto">
          <p className="text-gray-500 font-medium">No customer orders have been placed yet!</p>
        </div>
      ) : (
        <div className="space-y-5">
          {orders.map((order) => {
            const itemTotal = Math.round(order.price - (order.price * order.discount) / 100) * order.quantity;

            return (
              <div
                key={order._id}
                className="bg-white border border-gray-150 rounded-xl p-5 shadow-sm flex flex-col md:flex-row gap-5 hover:border-indigo-100 transition-all"
                id={`admin-order-item-${order._id}`}
              >
                {/* Product Thumbnail */}
                <div className="w-24 h-24 bg-gray-50 border rounded-lg overflow-hidden shrink-0 flex items-center justify-center p-2">
                  <img src={order.mainImg} alt={order.title} referrerPolicy="no-referrer" className="object-contain max-h-full max-w-full" />
                </div>

                {/* Info block */}
                <div className="flex-grow space-y-3.5">
                  
                  {/* Order header */}
                  <div>
                    <h3 className="font-extrabold text-sm text-indigo-900">{order.title}</h3>
                    <p className="text-xs text-gray-500 line-clamp-1 mt-0.5">{order.description}</p>
                    <div className="flex gap-4 text-xs font-semibold text-gray-400 mt-1.5">
                      <span>Size: <strong className="text-gray-700">{order.size}</strong></span>
                      <span>Quantity: <strong className="text-gray-700">{order.quantity}</strong></span>
                      <span>Price: <strong className="text-gray-700">₹{itemTotal}</strong></span>
                      <span>Payment: <strong className="text-gray-700 uppercase">{order.paymentMethod}</strong></span>
                    </div>
                  </div>

                  {/* Customer Metadata */}
                  <div className="bg-gray-50 border border-gray-100 rounded p-3 text-xs text-gray-600 grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <div className="space-y-1">
                      <div><strong>UserId:</strong> <span className="font-mono text-[11px]">{order.userId}</span></div>
                      <div><strong>Name:</strong> <span className="font-semibold text-gray-800">{order.name}</span></div>
                      <div><strong>Email:</strong> {order.email}</div>
                      <div><strong>Mobile:</strong> {order.mobile}</div>
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-1">
                        <Truck size={12} className="text-indigo-500" />
                        <span>Ordered: <strong>{order.orderDate}</strong></span>
                      </div>
                      <div className="flex items-center gap-1 text-indigo-500 font-bold">
                        <MapPin size={12} />
                        <span>Address: {order.address} ({order.pincode})</span>
                      </div>
                      <div><strong>Status:</strong> <span className="font-bold capitalize">{order.orderStatus}</span></div>
                    </div>
                  </div>

                  {/* Control triggers */}
                  <div className="flex flex-wrap items-center justify-between gap-4 pt-2.5 border-t border-gray-50 text-xs">
                    
                    {/* Status updater dropdown */}
                    <div className="flex items-center gap-2">
                      <label className="font-bold text-gray-500 uppercase tracking-wide">Update order status:</label>
                      <select
                        className="border border-gray-200 rounded p-1.5 bg-white font-semibold text-gray-700 focus:outline-none"
                        value={localStatuses[order._id] || order.orderStatus}
                        onChange={(e) => handleStatusChange(order._id, e.target.value)}
                      >
                        <option value="order placed">order placed</option>
                        <option value="In-transit">In-transit</option>
                        <option value="Delivered">Delivered</option>
                        <option value="Cancelled">Cancelled</option>
                      </select>
                      <button
                        onClick={() => handleUpdateStatusSubmit(order._id)}
                        className="py-1.5 px-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded shadow-sm transition-colors cursor-pointer"
                      >
                        Update
                      </button>
                    </div>

                    {/* Quick Cancel button */}
                    {order.orderStatus !== "Cancelled" && order.orderStatus !== "Delivered" && (
                      <button
                        onClick={() => handleCancelClick(order._id)}
                        className="py-1.5 px-4 bg-red-600 hover:bg-red-700 text-white font-bold rounded shadow-sm transition-colors cursor-pointer"
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
  );
}
