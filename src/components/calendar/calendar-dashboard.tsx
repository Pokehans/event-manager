"use client";

import { useMemo, useState } from "react";
import MonthNavigation from "@/components/calendar/month-navigation";
import MonthGrid from "@/components/calendar/month-grid";
import type { CalendarEvent } from "@/lib/events/get-events-for-month";

type Props = {
  initialDate: string;
  events: CalendarEvent[];
};

export default function CalendarDashboard({ initialDate, events }: Props) {
  const [currentDate, setCurrentDate] = useState(new Date(initialDate));

  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth();

  const filteredEvents = useMemo(() => {
    const monthString = String(currentMonth + 1).padStart(2, "0");

    return events.filter((event) => {
        const [year, month] = event.date.split("-");
        return Number(year) === currentYear && month === monthString;
    });
    }, [events, currentYear, currentMonth]);

  const handlePrev = () => {
    setCurrentDate(new Date(currentYear, currentMonth - 1, 1));
  };

  const handleNext = () => {
    setCurrentDate(new Date(currentYear, currentMonth + 1, 1));
  };

  const handleToday = () => {
    setCurrentDate(new Date());
  };

  return (
    <main className="space-y-6">
      <MonthNavigation
        currentDate={currentDate}
        onPrev={handlePrev}
        onNext={handleNext}
        onToday={handleToday}
      />

      <MonthGrid currentDate={currentDate} events={filteredEvents} />
    </main>
  );
}