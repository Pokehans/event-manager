"use client";

import { useRouter } from "next/navigation";
import MonthNavigation from "@/components/calendar/month-navigation";
import MonthGrid from "@/components/calendar/month-grid";
import type { CalendarEvent } from "@/lib/events/get-events-for-month";

type Props = {
  initialDate: string;
  events: CalendarEvent[];
};

function getDashboardUrl(date: Date) {
  const month = date.getMonth() + 1;
  const year = date.getFullYear();

  return `/dashboard?month=${month}&year=${year}`;
}

export default function CalendarDashboard({ initialDate, events }: Props) {
  const router = useRouter();
  const currentDate = new Date(initialDate);

  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth();

  const navigateToDate = (date: Date) => {
    router.push(getDashboardUrl(date));
  };

  const handlePrev = () => {
    navigateToDate(new Date(currentYear, currentMonth - 1, 1));
  };

  const handleNext = () => {
    navigateToDate(new Date(currentYear, currentMonth + 1, 1));
  };

  const handleToday = () => {
    const today = new Date();
    navigateToDate(new Date(today.getFullYear(), today.getMonth(), 1));
  };

  const handleMonthChange = (month: number) => {
    navigateToDate(new Date(currentYear, month, 1));
  };

  const handleYearChange = (year: number) => {
    navigateToDate(new Date(year, currentMonth, 1));
  };

  return (
    <main className="space-y-6">
      <MonthNavigation
        currentDate={currentDate}
        onPrev={handlePrev}
        onNext={handleNext}
        onToday={handleToday}
        onMonthChange={handleMonthChange}
        onYearChange={handleYearChange}
      />

      <MonthGrid currentDate={currentDate} events={events} />
    </main>
  );
}