export interface Banner {
  id: number;
  title: string;
  image_url: string;
  link_url?: string | null;
  sort_order: number;
  is_active: boolean;
}

export interface Doctor {
  id: number;
  user_id: number;
  specialty_id: number;
  description?: string | null;
  price: number | string;
  status?: string;
  deleted_at?: string | null;
  experience_years?: number;
  qualifications?: string[];
  work_schedule?: string;
  user: {
    id: number;
    full_name: string;
    email: string;
    phone_number?: string | null;
    avatar?: string | null;
    gender?: string | null;
    deleted_at?: string | null;
  };
  specialty?: {
    id: number;
    name: string;
    description?: string | null;
  };
}

export interface Article {
  id: number;
  author_id: number;
  specialty_id?: number | null;
  title: string;
  slug: string;
  thumbnail_url?: string | null;
  short_description?: string | null;
  views: number;
  created_at: string;
  author?: {
    id?: number;
    user?: {
      full_name: string;
      avatar?: string | null;
    };
  };
  specialty?: {
    id: number;
    name: string;
  };
  article_detail?: {
    id: number;
    article_id: number;
    html_content: string;
  };
}

export interface PackageDetail {
  id: number;
  package_id: number;
  html_content: string;
}

export interface Package {
  id: number;
  name: string;
  description?: string | null;
  thumbnail_url?: string | null;
  price: number | string;
  discount_price?: number | string | null;
  status?: string;
  deleted_at?: string | null;
  package_detail?: PackageDetail | null;
}

export interface CartDetailItem {
  id: number;
  cart_id?: number;
  package_id: number;
  quantity: number;
  price: number | string;
  package: Package;
}

export interface CartData {
  id: number | null;
  user_id?: number;
  sum: number;
  cart_details: CartDetailItem[];
  total_items: number;
  total_amount: number;
}

export interface TimeSlot {
  key: string;
  label: string;
  startTime: string;
  endTime: string;
  period: "morning" | "afternoon";
}

export const TIME_SLOTS: TimeSlot[] = [
  { key: "T1", label: "08:00 - 09:00", startTime: "08:00", endTime: "09:00", period: "morning" },
  { key: "T2", label: "09:00 - 10:00", startTime: "09:00", endTime: "10:00", period: "morning" },
  { key: "T3", label: "10:00 - 11:00", startTime: "10:00", endTime: "11:00", period: "morning" },
  { key: "T4", label: "11:00 - 12:00", startTime: "11:00", endTime: "12:00", period: "morning" },
  { key: "T5", label: "13:00 - 14:00", startTime: "13:00", endTime: "14:00", period: "afternoon" },
  { key: "T6", label: "14:00 - 15:00", startTime: "14:00", endTime: "15:00", period: "afternoon" },
  { key: "T7", label: "15:00 - 16:00", startTime: "15:00", endTime: "16:00", period: "afternoon" },
  { key: "T8", label: "16:00 - 17:00", startTime: "16:00", endTime: "17:00", period: "afternoon" },
];

export interface CreateAppointmentPayload {
  doctor_id: number;
  date: string;
  time_type: string;
  patient_name: string;
  patient_phone: string;
  symptoms?: string;
  package_id?: number;
}

export interface BookFromOrderPayload {
  doctor_id: number;
  date: string;
  time_type: string;
  patient_name: string;
  patient_phone: string;
  symptoms?: string;
}

export interface OrderDetail {
  id: number;
  order_id: number;
  package_id: number;
  package_name?: string;
  quantity: number;
  price: number | string;
  used_quantity?: number;
  used_count?: number;
  remaining_quantity?: number;
  package?: Package;
}

export interface Order {
  id: number;
  order_code: string;
  user_id: number;
  total_price: number | string;
  payment_status: "UNPAID" | "PAID" | "FAILED" | "CANCELLED";
  created_at: string;
  deleted_at?: string | null;
  order_details?: OrderDetail[];
  appointments?: Appointment[];
}

export interface Appointment {
  id: number;
  user_id: number;
  doctor_id: number;
  order_id?: number | null;
  package_id?: number | null;
  date: string;
  time_type: string;
  patient_name: string;
  patient_phone: string;
  symptoms?: string | null;
  status: "PENDING" | "CONFIRMED" | "COMPLETED" | "CANCELLED" | "NO_SHOW";
  type?: "OFFLINE" | "ONLINE";
  meeting_link?: string | null;
  created_at?: string;
  doctor?: Doctor;
  package?: Package;
  order?: Order;
}

export interface CheckoutCartResponse {
  order_code: string;
  payment_url: string;
  total_price: number;
}

