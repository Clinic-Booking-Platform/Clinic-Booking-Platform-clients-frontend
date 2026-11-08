import { redirect } from "next/navigation";

interface DoctorBookingPageProps {
  params: Promise<{ id: string }>;
}

export default async function DoctorBookingPage({ params }: DoctorBookingPageProps) {
  const { id } = await params;
  redirect(`/booking?doctor_id=${id}`);
}

