import CalendarDashboard from "@/components/calendar/calendar-dashboard";
import { getCurrentUser } from "@/lib/auth/get-current-user";
import { getEventsForMonth } from "@/lib/events/get-events-for-month";

export default async function DashboardPage() {
  const user = await getCurrentUser({ redirectTo: "/" });

  if (!user) return null;

  const now = new Date();
  const events = await getEventsForMonth(now.getFullYear(), now.getMonth());

  return (
    <CalendarDashboard
      initialDate={now.toISOString()}
      events={events}
    />
  );
}