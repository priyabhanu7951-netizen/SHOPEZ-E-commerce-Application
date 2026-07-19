import fs from "fs";
import path from "path";

const DATA_DIR = path.join(process.cwd(), "data");

// Helper to ensure data directory exists
function ensureDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

// Helper to read JSON file or return default
function readData<T>(filename: string, defaultValue: T): T {
  ensureDir();
  const filePath = path.join(DATA_DIR, filename);
  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, JSON.stringify(defaultValue, null, 2));
    return defaultValue;
  }
  try {
    const content = fs.readFileSync(filePath, "utf-8");
    return JSON.parse(content) as T;
  } catch (err) {
    console.error(`Error reading ${filename}, resetting to default:`, err);
    return defaultValue;
  }
}

// Helper to write JSON file
function writeData<T>(filename: string, data: T) {
  ensureDir();
  const filePath = path.join(DATA_DIR, filename);
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
}

// Types for DB
export interface DBUser {
  _id: string;
  username: string;
  password?: string;
  email: string;
  usertype: "Admin" | "Customer";
}

export interface DBAdmin {
  banner: string;
  categories: string[];
}

export interface DBProduct {
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

export interface DBCartItem {
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

export interface DBOrder {
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

// Seed values
const defaultAdmin: DBAdmin = {
  banner: "https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=1200&auto=format&fit=crop&q=80",
  categories: ["Fashion", "Electronics", "Mobiles", "Groceries", "Sports Equipments"],
};

const defaultProducts: DBProduct[] = [
  {
    _id: "prod_1",
    title: "Iphone 12",
    description: "Apple iPhone 12 with 8GB RAM, Super Retina XDR OLED display, and A14 Bionic chip.",
    mainImg: "https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?w=600&auto=format&fit=crop&q=80",
    carousel: [
      "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=600&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1580910051074-3eb694886505?w=600&auto=format&fit=crop&q=80"
    ],
    sizes: ["128GB", "256GB"],
    category: "Mobiles",
    gender: "Unisex",
    price: 79999,
    discount: 15,
  },
  {
    _id: "prod_2",
    title: "Realme buds",
    description: "TWS buds with 10.2mm dynamic drivers, active noise cancellation, and 28 hours battery life.",
    mainImg: "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=600&auto=format&fit=crop&q=80",
    carousel: [
      "https://images.unsplash.com/photo-1608156639585-b3a032ef9689?w=600&auto=format&fit=crop&q=80"
    ],
    sizes: ["Standard"],
    category: "Electronics",
    gender: "Unisex",
    price: 3999,
    discount: 35,
  },
  {
    _id: "prod_3",
    title: "MRF cricket bat",
    description: "Popular willow wood cricket bat from MRF. Suitable for all format plays in all conditions.",
    mainImg: "https://images.unsplash.com/photo-1531415080290-bc9854593f6f?w=600&auto=format&fit=crop&q=80",
    carousel: [
      "https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=600&auto=format&fit=crop&q=80"
    ],
    sizes: ["Short Handle", "Long Handle"],
    category: "Sports Equipments",
    gender: "Unisex",
    price: 1699,
    discount: 23,
  },
  {
    _id: "prod_4",
    title: "Carrom board",
    description: "Quality carrom board along with necessary equipment to make your free time more joyful.",
    mainImg: "https://images.unsplash.com/photo-1611195974226-a6a9be9dd763?w=600&auto=format&fit=crop&q=80",
    carousel: [
      "https://images.unsplash.com/photo-1611195974226-a6a9be9dd763?w=600&auto=format&fit=crop&q=80"
    ],
    sizes: ["Medium", "Large"],
    category: "Sports Equipments",
    gender: "Unisex",
    price: 1838,
    discount: 50,
  },
  {
    _id: "prod_5",
    title: "Kokabura cricket bat",
    description: "Imported cricket bat made with English willow wood. Premium bat to enhance your playing experience.",
    mainImg: "https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=600&auto=format&fit=crop&q=80",
    carousel: [],
    sizes: ["M", "L"],
    category: "Sports Equipments",
    gender: "Unisex",
    price: 4710,
    discount: 50,
  }
];

export class Database {
  static getUsers(): DBUser[] {
    const defaultUsers: DBUser[] = [
      {
        _id: "user_seeded_1",
        username: "Jane Customer",
        email: "customer@gmail.com",
        password: "customer123",
        usertype: "Customer"
      },
      {
        _id: "user_seeded_2",
        username: "ShopEZ Admin",
        email: "admin@gmail.com",
        password: "admin123",
        usertype: "Admin"
      }
    ];
    const users = readData<DBUser[]>("users.json", defaultUsers);
    if (users.length === 0) {
      writeData("users.json", defaultUsers);
      return defaultUsers;
    }
    return users;
  }

  static saveUsers(users: DBUser[]) {
    writeData("users.json", users);
  }

  static getAdminSettings(): DBAdmin {
    return readData<DBAdmin>("admin.json", defaultAdmin);
  }

  static saveAdminSettings(settings: DBAdmin) {
    writeData("admin.json", settings);
  }

  static getProducts(): DBProduct[] {
    return readData<DBProduct[]>("products.json", defaultProducts);
  }

  static saveProducts(products: DBProduct[]) {
    writeData("products.json", products);
  }

  static getCart(): DBCartItem[] {
    return readData<DBCartItem[]>("cart.json", []);
  }

  static saveCart(cart: DBCartItem[]) {
    writeData("cart.json", cart);
  }

  static getOrders(): DBOrder[] {
    return readData<DBOrder[]>("orders.json", []);
  }

  static saveOrders(orders: DBOrder[]) {
    writeData("orders.json", orders);
  }
}
