import { TimeType } from './schedule';

export type AppointmentStatus = 'PENDING' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED' | string;
export type AppointmentType = 'OFFLINE' | 'ONLINE';

export interface CreateAppointmentPayload {
  doctor_id: number;
  date: string; // YYYY-MM-DD
  time_type: TimeType | string;
  patient_name: string;
  patient_phone: string;
  symptoms?: string;
}

export interface AppointmentData {
  id: number;
  user_id: number;
  doctor_id: number;
  package_id?: number | null;
  order_id?: number | null;
  appointment_type?: AppointmentType | string;
  meeting_link?: string | null;
  date: string;
  time_type: string;
  status: AppointmentStatus;
  patient_name: string;
  patient_phone: string;
  symptoms?: string;
  deleted_at?: string | null;
  created_at?: string;
  updated_at?: string;
  doctor?: {
    id: number;
    price?: number | string;
    user?: {
      id?: number;
      full_name: string;
      email?: string;
      phone_number?: string | null;
      avatar?: string | null;
    };
    specialty?: {
      id?: number;
      name: string;
      image_url?: string | null;
    };
  };
  package?: {
    id: number;
    name: string;
    price?: number;
    thumbnail_url?: string | null;
  } | null;
}

export interface PrescriptionItem {
  id: number;
  medicine_name: string;
  dosage: string;
  frequency: string;
  duration: string;
}

export interface MedicalRecord {
  id: number;
  diagnosis: string;
  treatment?: string;
  prescriptions?: PrescriptionItem[];
}

export interface OrderInfo {
  id: number;
  order_code: string;
  total_price: number;
  payment_status: string;
}

export interface AppointmentDetail extends AppointmentData {
  doctor?: {
    id: number;
    price: number | string;
    user: {
      full_name: string;
      email: string;
      phone_number?: string | null;
      avatar?: string | null;
    };
    specialty?: {
      id: number;
      name: string;
      image_url?: string | null;
    };
  };
  package?: {
    id: number;
    name: string;
    price: number;
    thumbnail_url?: string | null;
  } | null;
  order?: OrderInfo | null;
  medical_record?: MedicalRecord | null;
}

export interface AppointmentListPagination {
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface AppointmentListData {
  appointments: AppointmentData[];
  pagination: AppointmentListPagination;
}

export interface AppointmentListResponse {
  status: string;
  message: string;
  data: AppointmentListData;
}

export interface AppointmentDetailResponse {
  status: string;
  message: string;
  data: AppointmentDetail;
}

export interface AppointmentResponse {
  status: string;
  message: string;
  data: AppointmentData;
}
