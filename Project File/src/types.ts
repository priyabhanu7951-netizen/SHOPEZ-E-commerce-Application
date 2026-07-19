export interface User {
  _id: string;
  username: string;
  email: string;
  usertype: "Admin" | "Customer";
}

export interface AdminSettings {
  banner: string;
  categories: string[];
}

export interface Product {
  _id: string;
  title: string;
  description: string;
  mainImg: string;
  carousel: string[];
  sizes: string[];
  category: string;
  gender: "Men" | "Women" | "Unisex";
  price: number;
  discount: number;
}

export interface CartItem {
  _id: string;
  userId: string;
  title: string;
  description: string;
  mainImg: string;
  size: string;
  quantity: number;
  price: number;
  discount: number;
}

export interface Order {
  _id: string;
  userId: string;
  name: string;
  email: string;
  mobile: string;
  address: string;
  pincode: string;
  title: string;
  description: string;
  mainImg: string;
  size: string;
  quantity: number;
  price: number;
  discount: number;
  paymentMethod: string;
  orderDate: string;
  deliveryDate: string;
  orderStatus: "order placed" | "In-transit" | "Delivered" | "Cancelled";
}
