"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import StatusBadge from "@/components/ui/status-badge";
import type { EventListItem } from "@/lib/events/get-events";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

type EventsTableProps = {
  events: EventListItemWithDebriefing[];
  from?: "list" | "archive";
  variant?: "events" | "archive";
};

type ViewMode = "table" | "months";

type EventListItemWithDebriefing = Omit<EventListItem, "event_debriefings"> & {
  event_debriefings?: { id?: string | null; rating?: string | null }[] | null;
};

const EVENTS_PER_PAGE = 12;

const MONTHS = [
  "Januar",
  "Februar",
  "März",
  "April",
  "Mai",
  "Juni",
  "Juli",
  "August",
  "September",
  "Oktober",
  "November",
  "Dezember",
];

function formatDate(date: string) {
  const [year, month, day] = date.split("-");
  return `${day}.${month}.${year}`;
}

function getTodayString() {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function formatMonth(date: string) {
  const [year, month] = date.split("-");

  const monthNames = [
    "Januar",
    "Februar",
    "März",
    "April",
    "Mai",
    "Juni",
    "Juli",
    "August",
    "September",
    "Oktober",
    "November",
    "Dezember",
  ];

  const monthIndex = Number(month) - 1;

  return `${monthNames[monthIndex]} ${year}`;
}

function getCustomerName(event: EventListItemWithDebriefing) {
  const fullName = [event.firstname, event.lastname].filter(Boolean).join(" ");
  return event.company_name || fullName || "—";
}

function getPersonCount(event: EventListItemWithDebriefing) {
  const adults = event.adults ?? 0;
  const children = event.children ?? 0;
  const total = adults + children;

  return total > 0 ? total : "—";
}

function getStatusLabel(status: string) {
  switch (status) {
    case "anfrage":
    case "Anfrage":
      return "Anfrage";
    case "bearbeitung":
    case "In Bearbeitung":
      return "In Bearbeitung";
    case "bestaetigt":
    case "Bestätigt":
      return "Bestätigt";
    case "storniert":
    case "Storniert":
      return "Storniert";
    case "archiviert":
    case "Archiviert":
      return "Archiviert";
    default:
      return status;
  }
}

function escapeCsvValue(value: string | number) {
  const stringValue = String(value);

  if (
    stringValue.includes(";") ||
    stringValue.includes('"') ||
    stringValue.includes("\n")
  ) {
    return `"${stringValue.replaceAll('"', '""')}"`;
  }

  return stringValue;
}

export default function EventsTable({
  events,
  from = "list",
  variant = "events",
}: EventsTableProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const getEventHref = (eventId: string) =>
    `/dashboard/events/${eventId}?from=${from}`;

  const isArchive = variant === "archive";
  const [archiveFromFilter, setArchiveFromFilter] = useState(
    isArchive ? searchParams.get("from") ?? "" : ""
  );

  const [archiveToFilter, setArchiveToFilter] = useState(
    isArchive ? searchParams.get("to") ?? "" : ""
  );
  const [searchTerm, setSearchTerm] = useState(searchParams.get("search") ?? "");
  const [statusFilter, setStatusFilter] = useState(
    isArchive ? "all" : searchParams.get("status") ?? "all"
  );
  const [ratingFilter, setRatingFilter] = useState(
    isArchive ? searchParams.get("rating") ?? "all" : "all"
  );
  const [monthFilter, setMonthFilter] = useState(searchParams.get("month") ?? "all");
  const [yearFilter, setYearFilter] = useState(searchParams.get("year") ?? "all");
  const [departmentFilter, setDepartmentFilter] = useState(
    searchParams.get("department") ?? "all"
  );
  const [roomFilter, setRoomFilter] = useState(searchParams.get("room") ?? "all");

const [paymentFilter, setPaymentFilter] = useState(
  searchParams.get("payment") ?? "all"
);

const [participantMinFilter, setParticipantMinFilter] = useState(
  searchParams.get("participantsMin") ?? ""
);

  const [participantMaxFilter, setParticipantMaxFilter] = useState(
    searchParams.get("participantsMax") ?? ""
  );

  const [timeRangeFilter, setTimeRangeFilter] = useState(
    searchParams.get("timeRange") ?? "all"
  );

  const participantSliderMax = Math.max(
    50,
    ...events.map((event) => (event.adults ?? 0) + (event.children ?? 0))
  );

  const minParticipantsValue = participantMinFilter
    ? Number(participantMinFilter)
    : 0;

  const maxParticipantsValue = participantMaxFilter
    ? Number(participantMaxFilter)
    : participantSliderMax;

  const participantMinPercent =
    (minParticipantsValue / participantSliderMax) * 100;

  const participantMaxPercent =
    (maxParticipantsValue / participantSliderMax) * 100;

  const [showPastEvents, setShowPastEvents] = useState(
    isArchive ? true : searchParams.get("past") === "1"
  );
  const [viewMode, setViewMode] = useState<ViewMode>(
    searchParams.get("view") === "months" ? "months" : "table"
  );
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedEventIds, setSelectedEventIds] = useState<string[]>([]);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [sortField, setSortField] = useState<"date" | "title" | "status">("date");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc"); 
  useEffect(() => {
    const params = new URLSearchParams();

    if (isArchive && ratingFilter !== "all") params.set("rating", ratingFilter);
    if (isArchive && archiveFromFilter) params.set("from", archiveFromFilter);
    if (isArchive && archiveToFilter) params.set("to", archiveToFilter);

    if (searchTerm.trim()) params.set("search", searchTerm.trim());
    if (!isArchive && statusFilter !== "all") params.set("status", statusFilter);
    if (monthFilter !== "all") params.set("month", monthFilter);
    if (yearFilter !== "all") params.set("year", yearFilter);
    if (departmentFilter !== "all") params.set("department", departmentFilter);
    if (roomFilter !== "all") params.set("room", roomFilter);
    if (paymentFilter !== "all") params.set("payment", paymentFilter);
    if (participantMinFilter.trim()) {
      params.set("participantsMin", participantMinFilter.trim());
    }
    if (participantMaxFilter.trim()) {
      params.set("participantsMax", participantMaxFilter.trim());
    }
    if (timeRangeFilter !== "all") params.set("timeRange", timeRangeFilter);
    if (!isArchive && showPastEvents) params.set("past", "1");
    if (viewMode !== "table") params.set("view", viewMode);

    const query = params.toString();

    router.replace(query ? `${pathname}?${query}` : pathname, {
      scroll: false,
    });
  }, [
    searchTerm,
    statusFilter,
    ratingFilter,
    monthFilter,
    yearFilter,
    departmentFilter,
    roomFilter,
    paymentFilter,
    participantMinFilter,
    participantMaxFilter,
    timeRangeFilter,
    showPastEvents,
    viewMode,
    pathname,
    router,
    archiveFromFilter,
    archiveToFilter,
    isArchive,
  ]);

  function resetFilters() {
  setSearchTerm("");
  if (!isArchive) setStatusFilter("all");
  if (isArchive) setRatingFilter("all");
  if (isArchive) {
    setArchiveFromFilter("");
    setArchiveToFilter("");
  }
  setMonthFilter("all");
  setYearFilter("all");
  setDepartmentFilter("all");
  setRoomFilter("all");
  setPaymentFilter("all");
  setParticipantMinFilter("");
  setParticipantMaxFilter("");
  setTimeRangeFilter("all");
  setShowPastEvents(isArchive);
  setCurrentPage(1);
}

function handleSort(field: "date" | "title" | "status") {
  if (sortField === field) {
    setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"));
  } else {
    setSortField(field);
    setSortDirection("asc");
  }

  setCurrentPage(1);
}

function getPaymentTypeLabel(value: string | null) {
  switch (value) {
    case "intern_aktivierung":
      return "Intern Aktivierung";
    case "rechnung":
      return "Rechnung";
    case "bar":
      return "Bar";
    default:
      return value ?? "";
  }
}

function getTimeRangeLabel(value: string) {
  switch (value) {
    case "today":
      return "Heute";
    case "next7":
      return "Nächste 7 Tage";
    case "next30":
      return "Nächste 30 Tage";
    case "last7":
      return "Letzte 7 Tage";
    case "last30":
      return "Letzte 30 Tage";
    default:
      return "";
  }
}

function getRatingLabel(value: string) {
  switch (value) {
    case "sehr_gut":
      return "Sehr gut";
    case "gut":
      return "Gut";
    case "neutral":
      return "Neutral";
    case "schlecht":
      return "Schlecht";
    default:
      return "";
  }
}

const hasActiveFilters =
  searchTerm.trim().length > 0 ||
  (!isArchive && statusFilter !== "all") ||
  (isArchive && ratingFilter !== "all") ||
  (isArchive && archiveFromFilter.trim().length > 0) ||
  (isArchive && archiveToFilter.trim().length > 0) ||
  monthFilter !== "all" ||
  yearFilter !== "all" ||
  departmentFilter !== "all" ||
  roomFilter !== "all" ||
  paymentFilter !== "all" ||
  participantMinFilter.trim().length > 0 ||
  participantMaxFilter.trim().length > 0 ||
  timeRangeFilter !== "all" ||
  (!isArchive && showPastEvents);

  const activeChips = [
    searchTerm && {
      label: `Suche: ${searchTerm}`,
      onRemove: () => setSearchTerm(""),
    },

    !isArchive && statusFilter !== "all" && {
      label: `Status: ${statusFilter}`,
      onRemove: () => setStatusFilter("all"),
    },

    isArchive && ratingFilter !== "all" && {
      label: `Bewertung: ${getRatingLabel(ratingFilter)}`,
      onRemove: () => setRatingFilter("all"),
    },

    isArchive && (archiveFromFilter || archiveToFilter) && {
      label: `Zeitraum: ${
        archiveFromFilter ? formatDate(archiveFromFilter) : "offen"
      } – ${archiveToFilter ? formatDate(archiveToFilter) : "offen"}`,
      onRemove: () => {
        setArchiveFromFilter("");
        setArchiveToFilter("");
      },
    },

    roomFilter !== "all" && {
      label:
        roomFilter === "__none__"
          ? "Raum: Ohne Raum"
          : `Raum: ${roomFilter}`,
      onRemove: () => setRoomFilter("all"),
    },

    departmentFilter !== "all" && {
      label: `Bereich: ${departmentFilter}`,
      onRemove: () => setDepartmentFilter("all"),
    },

    paymentFilter !== "all" && {
      label:
        paymentFilter === "__none__"
          ? "Zahlung: Ohne"
          : `Zahlung: ${getPaymentTypeLabel(paymentFilter)}`,
      onRemove: () => setPaymentFilter("all"),
    },

    timeRangeFilter !== "all" && {
      label: `Zeitraum: ${getTimeRangeLabel(timeRangeFilter)}`,
      onRemove: () => setTimeRangeFilter("all"),
    },

    (participantMinFilter || participantMaxFilter) && {
      label: `Teilnehmer: ${minParticipantsValue}–${maxParticipantsValue}`,
      onRemove: () => {
        setParticipantMinFilter("");
        setParticipantMaxFilter("");
      },
    },

    monthFilter !== "all" && {
      label: `Monat: ${MONTHS[Number(monthFilter) - 1]}`,
      onRemove: () => setMonthFilter("all"),
    },

    yearFilter !== "all" && {
      label: `Jahr: ${yearFilter}`,
      onRemove: () => setYearFilter("all"),
    },

    !isArchive && showPastEvents && {
      label: "Vergangene Events",
      onRemove: () => setShowPastEvents(false),
    },
  ].filter(
    (chip): chip is { label: string; onRemove: () => void } => Boolean(chip)
  );

  const statusOptions = useMemo(() => {
    return Array.from(
      new Set(
        events
          .map((event) => getStatusLabel(event.status))
          .filter((status) => status !== "Archiviert")
      )
    ).sort();
  }, [events]);

  const yearOptions = useMemo(() => {
    return Array.from(
      new Set(events.map((event) => event.date.slice(0, 4)))
    ).sort();
  }, [events]);

  const departmentOptions = useMemo(() => {
    return Array.from(
      new Set(
        events
          .map((event) => event.users?.departments?.name)
          .filter((department): department is string => Boolean(department))
      )
    ).sort();
  }, [events]);

  const roomOptions = useMemo(() => {
    return Array.from(
      new Set(
        events
          .map((event) => event.room?.trim())
          .filter((room): room is string => Boolean(room))
      )
    ).sort();
  }, [events]);

  const paymentOptions = useMemo(() => {
    const values = Array.from(
      new Set(events.map((event) => event.payment_type))
    );

    const cleaned = values
      .filter((v): v is string => Boolean(v))
      .sort();

    return cleaned;
  }, [events]);

  const filteredEvents = useMemo(() => {
    const today = getTodayString();

    return events.filter((event) => {
      const department = event.users?.departments;
      const customerName = getCustomerName(event).toLowerCase();
      const title = event.title.toLowerCase();
      const status = getStatusLabel(event.status);
      const eventYear = event.date.slice(0, 4);
      const eventMonth = event.date.slice(5, 7);
      const departmentName = department?.name ?? "";
      const roomName = event.room ?? "";
      const paymentType = event.payment_type ?? "";
      const eventRating = event.event_debriefings?.[0]?.rating ?? "";
      const participantCount = (event.adults ?? 0) + (event.children ?? 0);
      const search = searchTerm.toLowerCase().trim();
      const matchesArchiveDateRange =
        !isArchive ||
        ((!archiveFromFilter || event.date >= archiveFromFilter) &&
          (!archiveToFilter || event.date < archiveToFilter));

      const matchesSearch =
        search.length === 0 ||
        title.includes(search) ||
        customerName.includes(search);

      const matchesStatus = statusFilter === "all" || status === statusFilter;
      const matchesRating =
       !isArchive || ratingFilter === "all" || eventRating === ratingFilter;
      const matchesMonth =
        monthFilter === "all" || eventMonth === monthFilter;

      const matchesYear =
        yearFilter === "all" || eventYear === yearFilter;

      const matchesDepartment =
        departmentFilter === "all" || departmentName === departmentFilter;

      const matchesRoom =
        roomFilter === "all" ||
        (roomFilter === "__none__" && !roomName.trim()) ||
        roomName.trim() === roomFilter;

      const matchesPayment =
        paymentFilter === "all" ||
        (paymentFilter === "__none__" && !paymentType) ||
        paymentType === paymentFilter;

      const minParticipants = participantMinFilter.trim()
        ? Number(participantMinFilter)
        : null;

      const maxParticipants = participantMaxFilter.trim()
        ? Number(participantMaxFilter)
        : null;

      const matchesParticipants =
        (minParticipants === null || participantCount >= minParticipants) &&
        (maxParticipants === null || participantCount <= maxParticipants);

      const eventDate = new Date(`${event.date}T00:00:00`);
      const now = new Date();

      let matchesTimeRange = true;

      if (timeRangeFilter === "today") {
        matchesTimeRange = event.date === today;
      }

      if (timeRangeFilter === "next7") {
        const next7 = new Date();
        next7.setDate(now.getDate() + 7);
        matchesTimeRange = eventDate >= now && eventDate <= next7;
      }

      if (timeRangeFilter === "next30") {
        const next30 = new Date();
        next30.setDate(now.getDate() + 30);
        matchesTimeRange = eventDate >= now && eventDate <= next30;
      }

      if (timeRangeFilter === "last7") {
        const last7 = new Date();
        last7.setDate(now.getDate() - 7);
        matchesTimeRange = eventDate >= last7 && eventDate <= now;
      }

      if (timeRangeFilter === "last30") {
        const last30 = new Date();
        last30.setDate(now.getDate() - 30);
        matchesTimeRange = eventDate >= last30 && eventDate <= now;
      }

      const matchesTime = isArchive || showPastEvents || event.date >= today;

      return (
        matchesSearch &&
        matchesStatus &&
        matchesRating &&
        matchesArchiveDateRange &&
        matchesMonth &&
        matchesYear &&
        matchesDepartment &&
        matchesRoom &&
        matchesPayment &&
        matchesParticipants &&
        matchesTimeRange &&
        matchesTime
      );
    });
    }, [
    events,
    searchTerm,
    statusFilter,
    ratingFilter,
    monthFilter,
    yearFilter,
    departmentFilter,
    roomFilter,
    paymentFilter,
    participantMinFilter,
    participantMaxFilter,
    timeRangeFilter,
    showPastEvents,
    isArchive,
    archiveFromFilter,
    archiveToFilter,
  ]);

  const sortedEvents = useMemo(() => {
    const sorted = [...filteredEvents];

    sorted.sort((a, b) => {
      let compare = 0;

      if (sortField === "date") {
        compare = a.date.localeCompare(b.date);
      }

      if (sortField === "title") {
        compare = a.title.localeCompare(b.title);
      }

      if (sortField === "status") {
        compare = getStatusLabel(a.status).localeCompare(
          getStatusLabel(b.status)
        );
      }

      return sortDirection === "asc" ? compare : -compare;
    });

    return sorted;
  }, [filteredEvents, sortField, sortDirection]);

  const monthlyForecastEvents = useMemo(() => {
    if (monthFilter === "all" || yearFilter === "all") return [];

    return sortedEvents.filter((event) => {
      const eventYear = event.date.slice(0, 4);
      const eventMonth = event.date.slice(5, 7);

      return eventYear === yearFilter && eventMonth === monthFilter;
    });
  }, [sortedEvents, monthFilter, yearFilter]);

  function handleExportMonthlyForecast() {
    if (
      monthFilter === "all" ||
      yearFilter === "all" ||
      monthlyForecastEvents.length === 0
    ) {
      return;
    }

    const rows = [
      ["Datum", "Status", "Titel", "Auftraggeber", "Personen", "Bereich"],
      ...monthlyForecastEvents.map((event) => [
        formatDate(event.date),
        getStatusLabel(event.status),
        event.title,
        getCustomerName(event),
        getPersonCount(event),
        event.users?.departments?.name ?? "—",
      ]),
    ];

    const csvContent = rows
      .map((row) => row.map(escapeCsvValue).join(";"))
      .join("\n");

    const blob = new Blob([`\uFEFF${csvContent}`], {
      type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = `monatsforecast-${yearFilter}-${monthFilter}.csv`;
    link.click();

    URL.revokeObjectURL(url);
  }

  const totalPages = Math.max(
    1,
    Math.ceil(filteredEvents.length / EVENTS_PER_PAGE)
  );

  const paginatedEvents = useMemo(() => {
    const start = (currentPage - 1) * EVENTS_PER_PAGE;
    return sortedEvents.slice(start, start + EVENTS_PER_PAGE);
  }, [sortedEvents, currentPage]);

  const selectedCount = selectedEventIds.length;

  const visibleEventIds = paginatedEvents.map((event) => event.id);

  const allVisibleSelected =
    visibleEventIds.length > 0 &&
    visibleEventIds.every((id) => selectedEventIds.includes(id));

  const printHref =
    selectedCount > 0
      ? `/dashboard/events/print?ids=${selectedEventIds.join(",")}`
      : "#";

  function toggleEventSelection(eventId: string) {
    setSelectedEventIds((current) =>
      current.includes(eventId)
        ? current.filter((id) => id !== eventId)
        : [...current, eventId]
    );
  }

  function toggleVisibleEventsSelection() {
    setSelectedEventIds((current) => {
      if (allVisibleSelected) {
        return current.filter((id) => !visibleEventIds.includes(id));
      }

      return Array.from(new Set([...current, ...visibleEventIds]));
    });
  }

  const groupedEvents = useMemo(() => {
    return paginatedEvents.reduce<Record<string, EventListItemWithDebriefing[]>>(
      (groups, event) => {
        const month = event.date.slice(0, 7);

        if (!groups[month]) {
          groups[month] = [];
        }

        groups[month].push(event);
        return groups;
      },
      {}
    );
  }, [paginatedEvents]);

  if (events.length === 0) {
    return (
      <div className="rounded-2xl border border-[var(--color-border)] bg-white p-8 text-center shadow-sm">
        <h2 className="section-title">Keine Events vorhanden</h2>
        <p className="section-text mt-2">
          Sobald Events erstellt wurden, erscheinen sie hier.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-[var(--color-border)] bg-white/95 p-4 shadow-sm backdrop-blur lg:sticky lg:top-4 lg:z-20">
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between gap-3 lg:hidden">
            <div>
              <p className="text-sm font-semibold text-[var(--color-text)]">
                Filter
              </p>
              <p className="text-xs text-[var(--color-text-muted)]">
                {activeChips.length > 0
                  ? `${activeChips.length} Filter aktiv`
                  : "Keine Filter aktiv"}
              </p>
            </div>

            <button
              type="button"
              onClick={() => setFiltersOpen((prev) => !prev)}
              className="rounded-xl border border-[var(--color-border)] bg-white px-3 py-2 text-sm font-medium text-[var(--color-text-muted)] transition hover:bg-[var(--color-surface-muted)] hover:text-[var(--color-text)]"
            >
              {filtersOpen ? "Filter ausblenden" : "Filter anzeigen"}
            </button>
          </div>

          <div
            className={`${filtersOpen ? "flex" : "hidden"} flex-col gap-4 lg:flex`}
          >
            <div className="flex flex-col gap-3">
              <div className="grid gap-3 lg:grid-cols-[minmax(260px,2fr)_minmax(180px,1fr)]">
                <input
                  value={searchTerm}
                  onChange={(event) => {
                    setSearchTerm(event.target.value);
                    setCurrentPage(1);
                  }}
                  placeholder="Suche nach Titel oder Auftraggeber"
                  className="rounded-xl border border-[var(--color-border)] bg-white px-4 py-2.5 text-sm outline-none transition focus:border-[var(--color-primary)]"
                />

                <select
                  value={timeRangeFilter}
                  onChange={(event) => {
                    setTimeRangeFilter(event.target.value);
                    setCurrentPage(1);
                  }}
                  className="rounded-xl border border-[var(--color-border)] bg-white px-4 py-2.5 text-sm outline-none transition focus:border-[var(--color-primary)]"
                >
                  <option value="all">Alle Zeiträume</option>
                  <option value="today">Heute</option>

                  {isArchive ? (
                    <>
                      <option value="last7">Letzte 7 Tage</option>
                      <option value="last30">Letzte 30 Tage</option>
                    </>
                  ) : (
                    <>
                      <option value="next7">Nächste 7 Tage</option>
                      <option value="next30">Nächste 30 Tage</option>
                    </>
                  )}
                </select>
              </div>

              <div
                className={`grid gap-3 ${
                  isArchive ? "lg:grid-cols-4" : "lg:grid-cols-4"
                }`}
              >
                {isArchive ? (
                  <select
                    value={ratingFilter}
                    onChange={(event) => {
                      setRatingFilter(event.target.value);
                      setCurrentPage(1);
                    }}
                    className="rounded-xl border border-[var(--color-border)] bg-white px-4 py-2.5 text-sm outline-none transition focus:border-[var(--color-primary)]"
                  >
                    <option value="all">Alle Bewertungen</option>
                    <option value="sehr_gut">Sehr gut</option>
                    <option value="gut">Gut</option>
                    <option value="neutral">Neutral</option>
                    <option value="schlecht">Schlecht</option>
                  </select>
                ) : (
                  <select
                    value={statusFilter}
                    onChange={(event) => {
                      setStatusFilter(event.target.value);
                      setCurrentPage(1);
                    }}
                    className="rounded-xl border border-[var(--color-border)] bg-white px-4 py-2.5 text-sm outline-none transition focus:border-[var(--color-primary)]"
                  >
                    <option value="all">Alle Status</option>
                    {statusOptions.map((status) => (
                      <option key={status} value={status}>
                        {status}
                      </option>
                    ))}
                  </select>
                )}

                <select
                  value={roomFilter}
                  onChange={(event) => {
                    setRoomFilter(event.target.value);
                    setCurrentPage(1);
                  }}
                  className="rounded-xl border border-[var(--color-border)] bg-white px-4 py-2.5 text-sm outline-none transition focus:border-[var(--color-primary)]"
                >
                  <option value="all">Alle Räume</option>
                  <option value="__none__">Ohne Raum</option>
                  {roomOptions.map((room) => (
                    <option key={room} value={room}>
                      {room}
                    </option>
                  ))}
                </select>

                <select
                  value={departmentFilter}
                  onChange={(event) => {
                    setDepartmentFilter(event.target.value);
                    setCurrentPage(1);
                  }}
                  className="rounded-xl border border-[var(--color-border)] bg-white px-4 py-2.5 text-sm outline-none transition focus:border-[var(--color-primary)]"
                >
                  <option value="all">Alle Bereiche</option>
                  {departmentOptions.map((department) => (
                    <option key={department} value={department}>
                      {department}
                    </option>
                  ))}
                </select>

                <select
                  value={paymentFilter}
                  onChange={(event) => {
                    setPaymentFilter(event.target.value);
                    setCurrentPage(1);
                  }}
                  className="rounded-xl border border-[var(--color-border)] bg-white px-4 py-2.5 text-sm outline-none transition focus:border-[var(--color-primary)]"
                >
                  <option value="all">Alle Zahlungsarten</option>
                  <option value="__none__">Ohne Zahlungsart</option>
                  {paymentOptions.map((paymentType) => (
                    <option key={paymentType} value={paymentType}>
                      {getPaymentTypeLabel(paymentType)}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid gap-3 lg:grid-cols-2">
                <select
                  value={monthFilter}
                  onChange={(event) => {
                    setMonthFilter(event.target.value);
                    setCurrentPage(1);
                  }}
                  className="rounded-xl border border-[var(--color-border)] bg-white px-4 py-2.5 text-sm outline-none transition focus:border-[var(--color-primary)]"
                >
                  <option value="all">Alle Monate</option>
                  {MONTHS.map((month, index) => {
                    const value = String(index + 1).padStart(2, "0");

                    return (
                      <option key={month} value={value}>
                        {month}
                      </option>
                    );
                  })}
                </select>

                <select
                  value={yearFilter}
                  onChange={(event) => {
                    setYearFilter(event.target.value);
                    setCurrentPage(1);
                  }}
                  className="rounded-xl border border-[var(--color-border)] bg-white px-4 py-2.5 text-sm outline-none transition focus:border-[var(--color-primary)]"
                >
                  <option value="all">Alle Jahre</option>
                  {yearOptions.map((year) => (
                    <option key={year} value={year}>
                      {year}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="w-full rounded-xl border border-[var(--color-border)] bg-white px-4 py-3 shadow-sm">
              <div className="mb-3 flex items-center justify-between gap-3">
                <span className="text-sm font-medium text-[var(--color-text)]">
                  Teilnehmer
                </span>

                <span className="text-xs text-[var(--color-text-muted)]">
                  {minParticipantsValue} – {maxParticipantsValue} Personen
                </span>
              </div>

              <div className="relative h-8">
                <div className="absolute left-0 right-0 top-1/2 h-2 -translate-y-1/2 rounded-full bg-[var(--color-surface-muted)]" />

                <div
                  className="absolute top-1/2 h-2 -translate-y-1/2 rounded-full bg-[var(--color-primary)]"
                  style={{
                    left: `${participantMinPercent}%`,
                    right: `${100 - participantMaxPercent}%`,
                  }}
                />

                <input
                  type="range"
                  min={0}
                  max={participantSliderMax}
                  value={minParticipantsValue}
                  onChange={(event) => {
                    const value = Number(event.target.value);

                    if (value <= maxParticipantsValue) {
                      setParticipantMinFilter(String(value));
                      setCurrentPage(1);
                    }
                  }}
                  className="participant-range participant-range-min absolute left-0 top-1/2 z-30 h-0 w-full -translate-y-1/2 appearance-none bg-transparent"
                />

                <input
                  type="range"
                  min={0}
                  max={participantSliderMax}
                  value={maxParticipantsValue}
                  onChange={(event) => {
                    const value = Number(event.target.value);

                    if (value >= minParticipantsValue) {
                      setParticipantMaxFilter(String(value));
                      setCurrentPage(1);
                    }
                  }}
                  className="participant-range participant-range-max absolute left-0 top-1/2 z-20 h-0 w-full -translate-y-1/2 appearance-none bg-transparent"
                />
              </div>

              <div className="mt-1 flex justify-between text-[11px] text-[var(--color-text-muted)]">
                <span>0</span>
                <span>{participantSliderMax}+</span>
              </div>
            </div>

            {!isArchive ? (
              <label className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-[var(--color-border)] bg-white px-3 py-2 text-sm font-medium text-[var(--color-text-muted)] transition hover:bg-[var(--color-surface-muted)] sm:w-fit">
                <input
                  type="checkbox"
                  checked={showPastEvents}
                  onChange={(event) => {
                    setShowPastEvents(event.target.checked);
                    setCurrentPage(1);
                  }}
                  className="sr-only"
                />

                <span className="relative h-5 w-9 rounded-full border border-[var(--color-border)] bg-[var(--color-surface-muted)] transition">
                  <span
                    className={`absolute top-1/2 h-3.5 w-3.5 -translate-y-1/2 rounded-full transition ${
                      showPastEvents
                        ? "left-4 bg-[var(--color-primary)]"
                        : "left-0.5 bg-[var(--color-text-muted)]"
                    }`}
                  />
                </span>

                Vergangene Events
              </label>
            ) : null}
          </div>

          {activeChips.length > 0 && (
            <div className="mb-2 flex flex-wrap gap-2">
              {activeChips.map((chip, index) => (
                <div
                  key={index}
                  className="flex items-center gap-2 rounded-full border border-[var(--color-border)] bg-white px-3 py-1.5 text-xs shadow-sm"
                >
                  <span>{chip.label}</span>

                  <button
                    type="button"
                    onClick={() => {
                      chip.onRemove();
                      setCurrentPage(1);
                    }}
                    className="text-[var(--color-text-muted)] hover:text-[var(--color-text)]"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}

          <div className="flex flex-col gap-3 border-t border-[var(--color-border)] pt-4 lg:flex-row lg:items-center lg:justify-between">
            <p className="text-sm text-[var(--color-text-muted)]">
              {filteredEvents.length} Event
              {filteredEvents.length === 1 ? "" : "s"} gefunden
            </p>

            <div className="flex flex-wrap items-center gap-3">
              <div className="hidden rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-muted)] p-1 lg:inline-flex">
                <button
                  type="button"
                  onClick={() => {
                    setViewMode("table");
                    setCurrentPage(1);
                  }}
                  className={`rounded-lg px-3 py-1.5 text-sm font-semibold transition ${
                    viewMode === "table"
                      ? "bg-white text-[var(--color-primary)] shadow-sm"
                      : "text-[var(--color-text-muted)] hover:text-[var(--color-text)]"
                  }`}
                >
                  Tabelle
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setViewMode("months");
                    setCurrentPage(1);
                  }}
                  className={`rounded-lg px-3 py-1.5 text-sm font-semibold transition ${
                    viewMode === "months"
                      ? "bg-white text-[var(--color-primary)] shadow-sm"
                      : "text-[var(--color-text-muted)] hover:text-[var(--color-text)]"
                  }`}
                >
                  Monatsgruppen
                </button>
              </div>
              
              <button
                type="button"
                disabled={!hasActiveFilters}
                title={hasActiveFilters ? "Filter löschen" : "Keine Filter aktiv"}
                onClick={resetFilters}
                className="rounded-xl border border-[var(--color-border)] bg-white px-3 py-2 text-sm font-medium text-[var(--color-text-muted)] transition hover:bg-[var(--color-surface-muted)] hover:text-[var(--color-text)] disabled:cursor-not-allowed disabled:bg-[var(--color-border)] disabled:text-[var(--color-text-muted)] disabled:hover:bg-[var(--color-border)] disabled:hover:text-[var(--color-text-muted)]"
              >
                Filter löschen
              </button>
            </div>
          </div>
        </div>
      </div>

      {filteredEvents.length === 0 ? (
        <div className="rounded-2xl border border-[var(--color-border)] bg-white p-8 text-center shadow-sm">
          <h2 className="section-title">Keine passenden Events gefunden</h2>
          <p className="section-text mt-2">
            Passe die Suche oder Filter an, um wieder Events anzuzeigen.
          </p>
        </div>
      ) : viewMode === "table" ? (
        <div className="overflow-hidden rounded-2xl border border-[var(--color-border)] bg-white shadow-sm">
          <div className="hidden overflow-x-auto lg:block">
            <table className="w-full min-w-[900px] border-collapse text-left text-sm">
              <thead className="bg-[var(--color-surface-muted)] text-xs uppercase tracking-wide text-[var(--color-text-muted)]">
                <tr>
                  {!isArchive ? (
                    <th className="w-12 px-5 py-4">
                      <input
                        type="checkbox"
                        checked={allVisibleSelected}
                        onChange={toggleVisibleEventsSelection}
                        aria-label="Sichtbare Events auswählen"
                        className="h-4 w-4 rounded border-[var(--color-border)]"
                      />
                    </th>
                  ) : null}
                  <th
                    onClick={() => handleSort("date")}
                    className="cursor-pointer px-5 py-4 font-bold select-none hover:text-[var(--color-primary)]"
                  >
                    Datum {sortField === "date" ? (sortDirection === "asc" ? "↑" : "↓") : ""}
                  </th>

                  <th
                    onClick={() => handleSort("status")}
                    className="cursor-pointer px-5 py-4 font-bold select-none hover:text-[var(--color-primary)]"
                  >
                    Status {sortField === "status" ? (sortDirection === "asc" ? "↑" : "↓") : ""}
                  </th>

                  <th
                    onClick={() => handleSort("title")}
                    className="cursor-pointer px-5 py-4 font-bold select-none hover:text-[var(--color-primary)]"
                  >
                    Titel {sortField === "title" ? (sortDirection === "asc" ? "↑" : "↓") : ""}
                  </th>
                  <th className="px-5 py-4 font-bold">Auftraggeber</th>
                  <th className="px-5 py-4 font-bold">Personen</th>
                  <th className="px-5 py-4 font-bold">Bereich</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-[var(--color-border)]">
                {paginatedEvents.map((event) => {
                  const department = event.users?.departments;

                  return (
                    <tr
                      key={event.id}
                      className="group cursor-pointer transition hover:bg-[var(--color-surface-muted)]/70"
                    >
                      {!isArchive ? (
                        <td className="px-5 py-4">
                          <input
                            type="checkbox"
                            checked={selectedEventIds.includes(event.id)}
                            onChange={() => toggleEventSelection(event.id)}
                            aria-label={`${event.title} auswählen`}
                            className="h-4 w-4 rounded border-[var(--color-border)]"
                          />
                        </td>
                      ) : null}
                      <td className="whitespace-nowrap px-5 py-4 font-medium">
                        <Link
                          href={`/dashboard/events/${event.id}?from=${from === "archive" ? "archive" : "list"}`}
                          className="block"
                        >
                          {formatDate(event.date)}
                        </Link>
                      </td>

                      <td className="px-5 py-4">
                        <Link
                          href={`/dashboard/events/${event.id}?from=${from === "archive" ? "archive" : "list"}`}
                          className="block"
                        >
                          <StatusBadge label={getStatusLabel(event.status)} />
                        </Link>
                      </td>

                      <td className="px-5 py-4 font-semibold text-[var(--color-text)]">
                        <Link
                          href={getEventHref(event.id)}
                          className="block"
                        >
                          {event.title}
                        </Link>
                      </td>

                      <td className="px-5 py-4 text-[var(--color-text-muted)]">
                        <Link
                          href={getEventHref(event.id)}
                          className="block"
                        >
                          {getCustomerName(event)}
                        </Link>
                      </td>

                      <td className="px-5 py-4">
                        <Link
                          href={getEventHref(event.id)}
                          className="block"
                        >
                          {getPersonCount(event)}
                        </Link>
                      </td>

                      <td className="px-5 py-4">
                        <Link
                          href={getEventHref(event.id)}
                          className="block"
                        >
                          {department ? (
                            <span className="inline-flex items-center gap-2">
                              <span
                                className="h-2.5 w-2.5 rounded-full"
                                style={{ backgroundColor: department.color }}
                              />
                              {department.name}
                            </span>
                          ) : (
                            "—"
                          )}
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="divide-y divide-[var(--color-border)] lg:hidden">
            {paginatedEvents.map((event) => {
              const department = event.users?.departments;

              return (
                <Link
                  key={event.id}
                  href={getEventHref(event.id)}
                  className="block p-5 transition hover:bg-[var(--color-surface-muted)]"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3">
                      {!isArchive ? (
                        <input
                          type="checkbox"
                          checked={selectedEventIds.includes(event.id)}
                          onChange={(changeEvent) => {
                            changeEvent.preventDefault();
                            toggleEventSelection(event.id);
                          }}
                          onClick={(clickEvent) => clickEvent.stopPropagation()}
                          aria-label={`${event.title} auswählen`}
                          className="mt-1 h-4 w-4 rounded border-[var(--color-border)]"
                        />
                      ) : null}

                      <div>
                        <p className="text-sm font-bold text-[var(--color-primary)]">
                          {formatDate(event.date)}
                        </p>
                        <h2 className="mt-1 font-bold">{event.title}</h2>
                        <p className="mt-1 text-sm text-[var(--color-text-muted)]">
                          {getCustomerName(event)}
                        </p>
                      </div>
                    </div>

                    <StatusBadge label={getStatusLabel(event.status)} />
                  </div>

                  <div className="mt-4 grid gap-2 text-sm text-[var(--color-text-muted)]">
                    <p>Personen: {getPersonCount(event)}</p>
                    <p>
                      Bereich:{" "}
                      {department ? (
                        <span className="inline-flex items-center gap-2 text-[var(--color-text)]">
                          <span
                            className="h-2.5 w-2.5 rounded-full"
                            style={{ backgroundColor: department.color }}
                          />
                          {department.name}
                        </span>
                      ) : (
                        "—"
                      )}
                    </p>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {Object.entries(groupedEvents).map(([month, monthEvents]) => (
            <div
              key={month}
              className="overflow-hidden rounded-2xl border border-[var(--color-border)] bg-white shadow-sm"
            >
              <div className="border-b border-[var(--color-border)] bg-[var(--color-surface-muted)] px-5 py-4">
                <h2 className="font-bold text-[var(--color-primary)]">
                  {formatMonth(`${month}-01`)}
                </h2>
              </div>

              <div className="divide-y divide-[var(--color-border)]">
                {monthEvents.map((event) => {
                  const department = event.users?.departments;

                  return (
                    <Link
                      key={event.id}
                      href={getEventHref(event.id)}
                      className="block p-5 transition hover:bg-[var(--color-surface-muted)]"
                    >
                      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                        <div className="flex items-start gap-3">
                          {!isArchive ? (
                            <input
                              type="checkbox"
                              checked={selectedEventIds.includes(event.id)}
                              onChange={(changeEvent) => {
                                changeEvent.preventDefault();
                                toggleEventSelection(event.id);
                              }}
                              onClick={(clickEvent) => clickEvent.stopPropagation()}
                              aria-label={`${event.title} auswählen`}
                              className="mt-1 h-4 w-4 rounded border-[var(--color-border)]"
                            />
                          ) : null}

                          <div>
                            <p className="text-sm font-bold text-[var(--color-primary)]">
                              {formatDate(event.date)}
                            </p>
                            <h3 className="mt-1 font-bold">{event.title}</h3>
                            <p className="mt-1 text-sm text-[var(--color-text-muted)]">
                              {getCustomerName(event)}
                            </p>
                          </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-3 text-sm text-[var(--color-text-muted)]">
                          <StatusBadge label={getStatusLabel(event.status)} />
                          <span>Personen: {getPersonCount(event)}</span>

                          {department ? (
                            <span className="inline-flex items-center gap-2">
                              <span
                                className="h-2.5 w-2.5 rounded-full"
                                style={{ backgroundColor: department.color }}
                              />
                              {department.name}
                            </span>
                          ) : null}
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="flex flex-col gap-4 rounded-2xl border border-[var(--color-border)] bg-white p-4 shadow-sm lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <p className="text-sm text-[var(--color-text-muted)]">
            Seite {currentPage} von {totalPages}
          </p>

          <div className="flex gap-2">
            <button
              type="button"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
              className="rounded-lg border border-[var(--color-border)] px-4 py-2 text-sm font-semibold transition hover:bg-[var(--color-surface-muted)] disabled:cursor-not-allowed disabled:opacity-50"
            >
              Zurück
            </button>

            <button
              type="button"
              disabled={currentPage === totalPages}
              onClick={() =>
                setCurrentPage((page) => Math.min(totalPages, page + 1))
              }
              className="rounded-lg border border-[var(--color-border)] px-4 py-2 text-sm font-semibold transition hover:bg-[var(--color-surface-muted)] disabled:cursor-not-allowed disabled:opacity-50"
            >
              Weiter
            </button>
          </div>
        </div>

        {!isArchive ? (
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <button
              type="button"
              disabled={
                monthFilter === "all" ||
                yearFilter === "all" ||
                monthlyForecastEvents.length === 0
              }
              title={
                monthFilter === "all" || yearFilter === "all"
                  ? "Monat und Jahr wählen"
                  : "Monatsforecast exportieren"
              }
              onClick={handleExportMonthlyForecast}
              className="rounded-xl bg-[var(--color-primary)] px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:opacity-90 disabled:cursor-not-allowed disabled:bg-[var(--color-border)] disabled:text-[var(--color-text-muted)] disabled:shadow-none"
            >
              Monatsforecast exportieren
            </button>

            <button
              type="button"
              disabled={selectedCount === 0}
              onClick={() => {
                window.open(printHref, "_blank", "noopener,noreferrer");
              }}
              className="rounded-xl bg-[var(--color-primary)] px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:opacity-90 disabled:cursor-not-allowed disabled:bg-[var(--color-border)] disabled:text-[var(--color-text-muted)] disabled:shadow-none"
            >
              Laufzettel drucken ({selectedCount})
            </button>

            {selectedCount > 0 ? (
              <button
                type="button"
                onClick={() => setSelectedEventIds([])}
                className="rounded-xl border border-[var(--color-border)] bg-white px-4 py-2.5 text-sm font-semibold text-[var(--color-text-muted)] transition hover:bg-[var(--color-surface-muted)] hover:text-[var(--color-text)]"
              >
                Auswahl löschen
              </button>
            ) : null}
          </div>
        ) : null}
      </div>
    </div>
  );
}