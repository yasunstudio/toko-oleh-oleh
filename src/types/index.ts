export interface User {
  id: string;
  email: string;
  name: string;
  phone?: string;
  role: "ADMIN" | "CUSTOMER";
  address?: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
}

export interface ProductImage {
  id: string;
  url: string;
  productId?: string;
}

export interface Product {
  id: string;
  name: string;
  description?: string;
  price: number;
  stock: number;
  images: ProductImage[] | string[];
  slug: string;
  weight?: number | null;
  isActive: boolean;
  category?: Category;
  categoryId: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CartItem {
  id: string;
  quantity: number;
  product: {
    id: string;
    name: string;
    price: number;
    images: ProductImage[];
    stock: number;
    slug: string;
    category?: string; // Added category property
  };
}

export interface Order {
  id: string;
  orderNumber: string;
  status:
    | "PENDING"
    | "CONFIRMED"
    | "PROCESSING"
    | "SHIPPED"
    | "DELIVERED"
    | "CANCELLED";
  paymentStatus: "PENDING" | "PAID" | "VERIFIED" | "REJECTED";
  totalAmount: number;
  shippingAddress: string;
  notes?: string;
  paymentProof?: string;
  bankAccount?: string;
  createdAt: string;
  user: {
    name: string;
    email: string;
    phone?: string;
  };
  orderItems: {
    id: string;
    quantity: number;
    price: number;
    product: {
      name: string;
      images: string[];
    };
  }[];
}

export interface CustomerNotification {
  id: string;
  title: string;
  message: string;
  type: 'ORDER_STATUS' | 'PAYMENT_STATUS' | 'GENERAL';
  status: 'UNREAD' | 'READ';
  createdAt: string;
  orderId?: string;
  orderNumber?: string;
  data?: {
    oldStatus?: string;
    newStatus?: string;
    paymentStatus?: string;
  };
}

export interface NotificationData {
  id: string;
  userId: string;
  type: string;
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
  data?: any;
}
