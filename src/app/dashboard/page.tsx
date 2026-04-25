import CalendarDashboard from "@/components/calendar/calendar-dashboard";
import { getCurrentUser } from "@/lib/auth/get-current-user";
import { getEventsForMonth } from "@/lib/events/get-events-for-month";
import { getHolidaysForMonth } from "@/lib/holidays/get-holidays-for-month";

type DashboardPageProps = {
  searchParams?: Promise<{
    month?: string;
    year?: string;
  }>;
};

function getValidMonth(value?: string) {
  const month = Number(value);

  if (!Number.isInteger(month) || month < 1 || month > 12) {
    return null;
  }

  return month;
}

function getValidYear(value?: string) {
  const year = Number(value);
  const currentYear = new Date().getFullYear();

  if (!Number.isInteger(year) || year < currentYear - 10 || year > currentYear + 10) {
    return null;
  }

  return year;
}

export default async function DashboardPage({
  searchParams,
}: DashboardPageProps) {
  const user = await getCurrentUser({ redirectTo: "/" });

  if (!user) return null;

  const params = searchParams ? await searchParams : undefined;
  const now = new Date();

  const selectedMonth = getValidMonth(params?.month) ?? now.getMonth() + 1;
  const selectedYear = getValidYear(params?.year) ?? now.getFullYear();

  const selectedDate = new Date(selectedYear, selectedMonth - 1, 1);
  const [events, holidays] = await Promise.all([
    getEventsForMonth(selectedYear, selectedMonth - 1),
    getHolidaysForMonth(selectedYear, selectedMonth - 1),
  ]);

  return (
    <CalendarDashboard
      initialDate={selectedDate.toISOString()}
      events={events}
      holidays={holidays}
    />
  );
}