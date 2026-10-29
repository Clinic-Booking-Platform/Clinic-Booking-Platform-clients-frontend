export type DoctorUser = {
  id: number;
  full_name: string;
  email: string;
  phone_number?: string | null;
  avatar?: string | null;
  gender?: string | null;
  deleted_at?: string | null;
};

export type DoctorSpecialty = {
  id: number;
  name: string;
  description?: string;
};

export type Doctor = {
  id: number;
  user_id: number;
  specialty_id: number;
  description: string;
  price: string;
  deleted_at?: string | null;
  user: DoctorUser;
  specialty: DoctorSpecialty;
};

export type DoctorPagination = {
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
};

export type DoctorsData = {
  doctors: Doctor[];
  pagination: DoctorPagination;
};

export type DoctorsResponse = {
  status: string;
  message: string;
  data: DoctorsData;
};

export type DoctorQueryParams = {
  page?: number;
  pageSize?: number;
  specialty_id?: number | string;
  search?: string;
};
