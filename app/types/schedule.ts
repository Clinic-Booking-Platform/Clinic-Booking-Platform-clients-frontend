export type TimeType = 'T1' | 'T2' | 'T3' | 'T4' | 'T5' | 'T6' | 'T7' | 'T8';

export interface TimeSlotConfig {
  key: TimeType;
  label: string;
  startTime: string; // e.g. "08:00"
  endTime: string;   // e.g. "09:00"
  session: 'morning' | 'afternoon';
}

export const TIME_SLOTS: Record<TimeType, TimeSlotConfig> = {
  T1: { key: 'T1', label: '08:00 - 09:00', startTime: '08:00', endTime: '09:00', session: 'morning' },
  T2: { key: 'T2', label: '09:00 - 10:00', startTime: '09:00', endTime: '10:00', session: 'morning' },
  T3: { key: 'T3', label: '10:00 - 11:00', startTime: '10:00', endTime: '11:00', session: 'morning' },
  T4: { key: 'T4', label: '11:00 - 12:00', startTime: '11:00', endTime: '12:00', session: 'morning' },
  T5: { key: 'T5', label: '13:00 - 14:00', startTime: '13:00', endTime: '14:00', session: 'afternoon' },
  T6: { key: 'T6', label: '14:00 - 15:00', startTime: '14:00', endTime: '15:00', session: 'afternoon' },
  T7: { key: 'T7', label: '15:00 - 16:00', startTime: '15:00', endTime: '16:00', session: 'afternoon' },
  T8: { key: 'T8', label: '16:00 - 17:00', startTime: '16:00', endTime: '17:00', session: 'afternoon' },
};

export type ScheduleStatus = 'AVAILABLE' | 'FULL' | 'CANCELLED';

export interface Schedule {
  id: number;
  doctor_id: number;
  date: string;
  time_type: TimeType;
  max_number: number;
  current_number: number;
  status: ScheduleStatus | string;
}

export interface SchedulesData {
  schedules: Schedule[];
  pagination?: {
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
  };
}

export interface SchedulesResponse {
  status: string;
  message?: string;
  data: Schedule[] | SchedulesData;
}

export type SlotAvailabilityStatus = 'AVAILABLE' | 'FULL' | 'PASSED' | 'NOT_SCHEDULED';

/**
 * Checks if a given time slot on a specific date has already passed based on Vietnam Time (UTC+7).
 */
export function isSlotPassedInVN(dateStr: string, startTime: string): boolean {
  try {
    // Current date and time in Vietnam (Asia/Ho_Chi_Minh)
    const now = new Date();
    const vnDateFormatter = new Intl.DateTimeFormat('en-CA', {
      timeZone: 'Asia/Ho_Chi_Minh',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
    const todayInVN = vnDateFormatter.format(now); // "YYYY-MM-DD"

    if (dateStr < todayInVN) {
      return true;
    }
    if (dateStr > todayInVN) {
      return false;
    }

    // It is today in VN -> compare current time with startTime
    const vnTimeParts = new Intl.DateTimeFormat('en-GB', {
      timeZone: 'Asia/Ho_Chi_Minh',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    }).format(now); // "HH:mm"

    return vnTimeParts >= startTime;
  } catch {
    // Fallback if Intl format fails
    return false;
  }
}

