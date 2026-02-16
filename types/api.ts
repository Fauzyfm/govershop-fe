export interface APIResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
}

export interface Product {
  buyer_sku_code: string;
  product_name: string;
  display_name?: string;
  category: string;
  brand: string;
  type: string;
  price: number;
  original_price?: number;
  is_available: boolean;
  unlimited_stock: boolean;
  stock?: number;
  description?: string;
  is_promo: boolean;
  is_best_seller?: boolean;
  tags?: string[];
  image_url?: string;
  markup_percent?: number;
}

export interface PaymentMethod {
  code: string;
  name: string;
  type: 'qris' | 'va' | 'paypal';
  icon_url?: string;
}

export interface PriceCalculation {
  product_price: number;
  admin_fee: number;
  payment_fee: number;
  total_price: number;
  product_name: string;
  payment_method_label: string;
  breakdown: {
    items: { label: string; amount: number }[];
  };
}

export interface CreateOrderRequest {
  buyer_sku_code: string;
  customer_no: string;
  customer_email?: string;
  customer_phone?: string;
  customer_name?: string;
}

// Status types
export type OrderStatus = 
  | 'pending' 
  | 'waiting_payment' 
  | 'paid' 
  | 'processing' 
  | 'success' 
  | 'failed' 
  | 'expired'
  | 'cancelled' 
  | 'refunded';

// Order response from GET /orders/{id}
export interface OrderResponse {
  id: string;
  ref_id: string;
  buyer_sku_code: string;
  product_name: string;
  customer_no: string;
  price: number;  // selling_price
  status: OrderStatus;
  created_at: string;
}

// Order status response from GET /orders/{id}/status
export interface OrderStatusResponse {
  order_id: string;
  ref_id?: string;
  status: OrderStatus;
  status_label: string;
  serial_number?: string;
  message?: string;
  payment?: PaymentInfo;
}

// Payment info returned in order status
export interface PaymentInfo {
  id: string;
  order_id: string;
  payment_method: string;
  payment_number: string;
  qr_string?: string;
  qr_image_url?: string;
  va_number?: string;
  amount: number;
  fee: number;
  total_payment: number;
  status: string;
  expired_at: string;
  paid_at?: string;
}

export interface Brand {
    name: string;
    description?: string;
    image_url?: string;
    status: string;
}

// Content Types
export interface CarouselItem {
    id: number;
    image_url: string;
    title?: string;
    link_url?: string;
}

export interface PopupItem {
    id: number;
    image_url: string;
    title?: string;
    description?: string;
    link_url?: string;
}

export interface BrandPublicData {
    brand_name: string;
    image_url: string;
    is_best_seller: boolean;
    is_visible: boolean;
    status: string;
}

export interface OrderHistoryResponse {
    id: string;
    product_name: string;
    created_at: string;
    status: string;
    status_label: string;
    price: number;
}

export interface ValidateAccountResponse {
    is_valid: boolean;
    account_name: string;
    message?: string;
}
