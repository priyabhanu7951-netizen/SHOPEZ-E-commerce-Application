import { Router, Request, Response } from "express";
import { Database, DBOrder } from "./db";

export const apiRouter = Router();

// Simple helper to generate random IDs
const genId = () => Math.random().toString(36).substring(2, 9);

// ==================== AUTH / USERS ====================

// Register
apiRouter.post("/auth/register", (req: Request, res: Response): void => {
  try {
    const { username, email, password, usertype } = req.body;
    if (!username || !email || !password || !usertype) {
      res.status(400).json({ error: "All fields are required" });
      return;
    }

    const users = Database.getUsers();
    if (users.some((u) => u.email === email)) {
      res.status(400).json({ error: "Email is already registered" });
      return;
    }

    const newUser = {
      _id: "user_" + genId(),
      username,
      email,
      password, // Simple text storage as requested in diagram
      usertype: usertype as "Admin" | "Customer",
    };

    users.push(newUser);
    Database.saveUsers(users);

    const { password: _, ...userWithoutPassword } = newUser;
    res.status(201).json(userWithoutPassword);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Login
apiRouter.post("/auth/login", (req: Request, res: Response): void => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      res.status(400).json({ error: "Email and password are required" });
      return;
    }

    const users = Database.getUsers();
    const user = users.find((u) => u.email === email && u.password === password);

    if (!user) {
      res.status(401).json({ error: "Invalid email or password" });
      return;
    }

    const { password: _, ...userWithoutPassword } = user;
    res.json(userWithoutPassword);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Get all users
apiRouter.get("/users", (req: Request, res: Response): void => {
  try {
    const users = Database.getUsers().map(({ password, ...u }) => u);
    res.json(users);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});


// ==================== ADMIN SETTINGS ====================

// Get setting
apiRouter.get("/admin/settings", (req: Request, res: Response): void => {
  try {
    const settings = Database.getAdminSettings();
    res.json(settings);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Update banner/settings
apiRouter.put("/admin/settings", (req: Request, res: Response): void => {
  try {
    const { banner, categories } = req.body;
    const settings = Database.getAdminSettings();
    if (banner !== undefined) settings.banner = banner;
    if (categories !== undefined) settings.categories = categories;

    Database.saveAdminSettings(settings);
    res.json(settings);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});


// ==================== PRODUCTS ====================

// Get all products
apiRouter.get("/products", (req: Request, res: Response): void => {
  try {
    const products = Database.getProducts();
    res.json(products);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Get single product
apiRouter.get("/products/:id", (req: Request, res: Response): void => {
  try {
    const products = Database.getProducts();
    const product = products.find((p) => p._id === req.params.id);
    if (!product) {
      res.status(404).json({ error: "Product not found" });
      return;
    }
    res.json(product);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Add product
apiRouter.post("/products", (req: Request, res: Response): void => {
  try {
    const { title, description, mainImg, carousel, sizes, category, gender, price, discount } = req.body;
    if (!title || !description || !mainImg || !category || !gender || price === undefined) {
      res.status(400).json({ error: "Missing required product fields" });
      return;
    }

    const products = Database.getProducts();
    const newProduct = {
      _id: "prod_" + genId(),
      title,
      description,
      mainImg,
      carousel: carousel || [],
      sizes: sizes || [],
      category,
      gender,
      price: Number(price),
      discount: Number(discount || 0),
    };

    products.push(newProduct);
    Database.saveProducts(products);
    res.status(201).json(newProduct);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Update product
apiRouter.put("/products/:id", (req: Request, res: Response): void => {
  try {
    const { title, description, mainImg, carousel, sizes, category, gender, price, discount } = req.body;
    const products = Database.getProducts();
    const idx = products.findIndex((p) => p._id === req.params.id);

    if (idx === -1) {
      res.status(404).json({ error: "Product not found" });
      return;
    }

    const updated = {
      ...products[idx],
      title: title !== undefined ? title : products[idx].title,
      description: description !== undefined ? description : products[idx].description,
      mainImg: mainImg !== undefined ? mainImg : products[idx].mainImg,
      carousel: carousel !== undefined ? carousel : products[idx].carousel,
      sizes: sizes !== undefined ? sizes : products[idx].sizes,
      category: category !== undefined ? category : products[idx].category,
      gender: gender !== undefined ? gender : products[idx].gender,
      price: price !== undefined ? Number(price) : products[idx].price,
      discount: discount !== undefined ? Number(discount) : products[idx].discount,
    };

    products[idx] = updated;
    Database.saveProducts(products);
    res.json(updated);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Delete product
apiRouter.delete("/products/:id", (req: Request, res: Response): void => {
  try {
    const products = Database.getProducts();
    const filtered = products.filter((p) => p._id !== req.params.id);
    if (products.length === filtered.length) {
      res.status(404).json({ error: "Product not found" });
      return;
    }
    Database.saveProducts(filtered);
    res.json({ success: true, message: "Product deleted" });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});


// ==================== CART ====================

// Get cart
apiRouter.get("/cart", (req: Request, res: Response): void => {
  try {
    const { userId } = req.query;
    if (!userId) {
      res.status(400).json({ error: "userId is required" });
      return;
    }
    const cart = Database.getCart().filter((item) => item.userId === userId);
    res.json(cart);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Add to cart
apiRouter.post("/cart", (req: Request, res: Response): void => {
  try {
    const { userId, title, description, mainImg, size, quantity, price, discount } = req.body;
    if (!userId || !title || !mainImg || !price) {
      res.status(400).json({ error: "Missing cart item details" });
      return;
    }

    const cart = Database.getCart();

    // Check if duplicate item (same user, title, and size)
    const existingIdx = cart.findIndex(
      (item) => item.userId === userId && item.title === title && item.size === size
    );

    if (existingIdx !== -1) {
      cart[existingIdx].quantity += Number(quantity || 1);
      Database.saveCart(cart);
      res.json(cart[existingIdx]);
      return;
    }

    const newItem = {
      _id: "cart_" + genId(),
      userId,
      title,
      description: description || "",
      mainImg,
      size: size || "Standard",
      quantity: Number(quantity || 1),
      price: Number(price),
      discount: Number(discount || 0),
    };

    cart.push(newItem);
    Database.saveCart(cart);
    res.status(201).json(newItem);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Update cart item quantity or size
apiRouter.put("/cart/:id", (req: Request, res: Response): void => {
  try {
    const { quantity, size } = req.body;
    const cart = Database.getCart();
    const idx = cart.findIndex((item) => item._id === req.params.id);

    if (idx === -1) {
      res.status(404).json({ error: "Cart item not found" });
      return;
    }

    if (quantity !== undefined) {
      cart[idx].quantity = Number(quantity);
    }
    if (size !== undefined) {
      cart[idx].size = size;
    }

    Database.saveCart(cart);
    res.json(cart[idx]);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Remove from cart
apiRouter.delete("/cart/:id", (req: Request, res: Response): void => {
  try {
    const cart = Database.getCart();
    const filtered = cart.filter((item) => item._id !== req.params.id);
    if (cart.length === filtered.length) {
      res.status(404).json({ error: "Cart item not found" });
      return;
    }
    Database.saveCart(filtered);
    res.json({ success: true, message: "Removed from cart" });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Clear cart
apiRouter.delete("/cart", (req: Request, res: Response): void => {
  try {
    const { userId } = req.query;
    if (!userId) {
      res.status(400).json({ error: "userId is required" });
      return;
    }
    const cart = Database.getCart();
    const remaining = cart.filter((item) => item.userId !== userId);
    Database.saveCart(remaining);
    res.json({ success: true, message: "Cart cleared" });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});


// ==================== ORDERS ====================

// Get orders (optionally filter by user)
apiRouter.get("/orders", (req: Request, res: Response): void => {
  try {
    const { userId } = req.query;
    let orders = Database.getOrders();
    if (userId) {
      orders = orders.filter((o) => o.userId === userId);
    }
    res.json(orders);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Place order (can accept single or list of items)
apiRouter.post("/orders", (req: Request, res: Response): void => {
  try {
    const {
      userId,
      name,
      email,
      mobile,
      address,
      pincode,
      paymentMethod,
      items, // Expecting array of { title, description, mainImg, size, quantity, price, discount }
    } = req.body;

    if (!userId || !name || !email || !mobile || !address || !pincode || !paymentMethod || !items || !Array.isArray(items)) {
      res.status(400).json({ error: "Missing required order details" });
      return;
    }

    const orders = Database.getOrders();
    const newOrders: DBOrder[] = [];

    const orderDate = new Date().toISOString().split("T")[0]; // YYYY-MM-DD
    // Calculate 7 days from now for delivery date
    const d = new Date();
    d.setDate(d.getDate() + 7);
    const deliveryDate = d.toISOString().split("T")[0];

    for (const item of items) {
      const orderEntry: DBOrder = {
        _id: "order_" + genId(),
        userId,
        name,
        email,
        mobile,
        address,
        pincode,
        title: item.title,
        description: item.description || "",
        mainImg: item.mainImg,
        size: item.size || "Standard",
        quantity: Number(item.quantity || 1),
        price: Number(item.price),
        discount: Number(item.discount || 0),
        paymentMethod,
        orderDate,
        deliveryDate,
        orderStatus: "order placed",
      };
      orders.push(orderEntry);
      newOrders.push(orderEntry);
    }

    Database.saveOrders(orders);
    res.status(201).json(newOrders);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Update order status
apiRouter.put("/orders/:id/status", (req: Request, res: Response): void => {
  try {
    const { status } = req.body;
    const orders = Database.getOrders();
    const idx = orders.findIndex((o) => o._id === req.params.id);

    if (idx === -1) {
      res.status(404).json({ error: "Order not found" });
      return;
    }

    orders[idx].orderStatus = status;
    Database.saveOrders(orders);
    res.json(orders[idx]);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Cancel order
apiRouter.put("/orders/:id/cancel", (req: Request, res: Response): void => {
  try {
    const orders = Database.getOrders();
    const idx = orders.findIndex((o) => o._id === req.params.id);

    if (idx === -1) {
      res.status(404).json({ error: "Order not found" });
      return;
    }

    orders[idx].orderStatus = "Cancelled";
    Database.saveOrders(orders);
    res.json(orders[idx]);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});
