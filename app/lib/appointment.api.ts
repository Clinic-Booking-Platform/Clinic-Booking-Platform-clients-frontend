import api from './api.clients';
import { 
  CreateAppointmentPayload, 
  AppointmentResponse,
  AppointmentListData,
  AppointmentListResponse,
  AppointmentDetail,
  AppointmentDetailResponse
} from '../types/appointment';

export const createAppointment = async (
  payload: CreateAppointmentPayload
): Promise<AppointmentResponse> => {
  const response = await api.post<AppointmentResponse>('/appointments', payload);
  return response.data;
};

export const getUserAppointments = async (
  page: number = 1,
  status?: string
): Promise<AppointmentListData> => {
  const params: Record<string, string | number> = { page };
  if (status && status !== 'ALL') {
    params.status = status;
  }

  const response = await api.get<AppointmentListResponse>('/appointments', { params });
  const data = response.data?.data;

  // Normalize response
  if (data && Array.isArray((data as unknown as { appointments: unknown[] }).appointments)) {
    return data;
  }

  if (Array.isArray(data)) {
    return {
      appointments: data,
      pagination: {
        total: data.length,
        page,
        pageSize: 10,
        totalPages: Math.ceil(data.length / 10) || 1,
      },
    };
  }

  return {
    appointments: [],
    pagination: {
      total: 0,
      page: 1,
      pageSize: 10,
      totalPages: 1,
    },
  };
};

export const getAppointmentDetail = async (
  id: number | string
): Promise<AppointmentDetail> => {
  const response = await api.get<AppointmentDetailResponse>(`/appointments/${id}`);
  return response.data.data;
};

export const cancelAppointment = async (
  id: number | string
): Promise<{ status: string; message: string }> => {
  const response = await api.delete<{ status: string; message: string }>(`/appointments/${id}`);
  return response.data;
};
