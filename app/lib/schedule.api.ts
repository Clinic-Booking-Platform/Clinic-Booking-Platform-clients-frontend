import api from './api.clients';
import { Schedule, SchedulesResponse } from '../types/schedule';

export const getDoctorSchedules = async (
  doctorId: number | string,
  date: string
): Promise<Schedule[]> => {
  const response = await api.get<SchedulesResponse>('/schedules', {
    params: {
      doctor_id: doctorId,
      date,
    },
  });

  const resData = response.data?.data;
  if (Array.isArray(resData)) {
    return resData;
  }
  if (
    resData &&
    typeof resData === 'object' &&
    'schedules' in resData &&
    Array.isArray(resData.schedules)
  ) {
    return resData.schedules;
  }
  return [];
};
