"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import StatusBadge from "@/components/ui/status-badge";
import type { EventListItem } from "@/lib/events/get-events";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

type EventsTableProps = {
  events: EventListItem[];
  from?: "list" | "archive";
};

type ViewMode = "table" | "months";

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

function getCustomerName(event: EventListItem) {
  const fullName = [event.firstname, event.lastname].filter(Boolean).join(" ");
  return event.company_name || fullName || "—";
}

function getPersonCount(event: EventListItem) {
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

export default function EventsTable({ events, from = "list" }: EventsTableProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const getEventHref = (eventId: string) =>
    `/dashboard/events/${eventId}?from=${from}`;

  const [searchTerm, setSearchTerm] = useState(searchParams.get("search") ?? "");
  const [statusFilter, setStatusFilter] = useState(searchParams.get("status") ?? "all");
  const [monthFilter, setMonthFilter] = useState(searchParams.get("month") ?? "all");
  const [yearFilter, setYearFilter] = useState(searchParams.get("year") ?? "all");
  const [departmentFilter, setDepartmentFilter] = useState(
    searchParams.get("department") ?? "all"
  );
  const [showPastEvents, setShowPastEvents] = useState(searchParams.get("past") === "1");
  const [viewMode, setViewMode] = useState<ViewMode>(
    searchParams.get("view") === "months" ? "months" : "table"
  );
  const [currentPage, setCurrentPage] = useState(1);
  const [sortField, setSortField] = useState<"date" | "title" | "status">("date");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc"); 
  useEffect(() => {
    const params = new URLSearchParams();

    if (searchTerm.trim()) params.set("search", searchTerm.trim());
    if (statusFilter !== "all") params.set("status", statusFilter);
    if (monthFilter !== "all") params.set("month", monthFilter);
    if (yearFilter !== "all") params.set("year", yearFilter);
    if (departmentFilter !== "all") params.set("department", departmentFilter);
    if (showPastEvents) params.set("past", "1");
    if (viewMode !== "table") params.set("view", viewMode);

    const query = params.toString();

    router.replace(query ? `${pathname}?${query}` : pathname, {
      scroll: false,
    });
  }, [
    searchTerm,
    statusFilter,
    monthFilter,
    yearFilter,
    departmentFilter,
    showPastEvents,
    viewMode,
    pathname,
    router,
  ]);

  function resetFilters() {
  setSearchTerm("");
  setStatusFilter("all");
  setMonthFilter("all");
  setYearFilter("all");
  setDepartmentFilter("all");
  setShowPastEvents(false);
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

const hasActiveFilters =
  searchTerm.trim().length > 0 ||
  statusFilter !== "all" ||
  monthFilter !== "all" ||
  yearFilter !== "all" ||
  departmentFilter !== "all" ||
  showPastEvents;

  const statusOptions = useMemo(() => {
    return Array.from(
      new Set(events.map((event) => getStatusLabel(event.status)))
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
      const search = searchTerm.toLowerCase().trim();

      const matchesSearch =
        search.length === 0 ||
        title.includes(search) ||
        customerName.includes(search);

      const matchesStatus = statusFilter === "all" || status === statusFilter;
      const matchesMonth =
        monthFilter === "all" || eventMonth === monthFilter;

      const matchesYear =
        yearFilter === "all" || eventYear === yearFilter;

      const matchesDepartment =
        departmentFilter === "all" || departmentName === departmentFilter;

      const matchesTime = showPastEvents || event.date >= today;

      return (
        matchesSearch &&
        matchesStatus &&
        matchesMonth &&
        matchesYear &&
        matchesDepartment &&
        matchesTime
      );
    });
    }, [
    events,
    searchTerm,
    statusFilter,
    monthFilter,
    yearFilter,
    departmentFilter,
    showPastEvents,
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

  const groupedEvents = useMemo(() => {
    return paginatedEvents.reduce<Record<string, EventListItem[]>>(
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
      <div className="rounded-2xl border border-[var(--color-border)] bg-white p-4 shadow-sm">
        <div className="flex flex-col gap-4">
          <div className="grid gap-3 lg:grid-cols-[minmax(260px,2fr)_repeat(4,minmax(140px,1fr))]">
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
          </div>

          <div className="flex flex-col gap-3 border-t border-[var(--color-border)] pt-4 lg:flex-row lg:items-center lg:justify-between">
            <p className="text-sm text-[var(--color-text-muted)]">
              {filteredEvents.length} Event
              {filteredEvents.length === 1 ? "" : "s"} gefunden
            </p>

            <div className="flex flex-wrap items-center gap-3">
              <label className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-[var(--color-border)] bg-white px-3 py-2 text-sm font-medium text-[var(--color-text-muted)] transition hover:bg-[var(--color-surface-muted)]">
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

              <div className="inline-flex rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-muted)] p-1">
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
                    <div>
                      <p className="text-sm font-bold text-[var(--color-primary)]">
                        {formatDate(event.date)}
                      </p>
                      <h2 className="mt-1 font-bold">{event.title}</h2>
                      <p className="mt-1 text-sm text-[var(--color-text-muted)]">
                        {getCustomerName(event)}
                      </p>
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
                        <div>
                          <p className="text-sm font-bold text-[var(--color-primary)]">
                            {formatDate(event.date)}
                          </p>
                          <h3 className="mt-1 font-bold">{event.title}</h3>
                          <p className="mt-1 text-sm text-[var(--color-text-muted)]">
                            {getCustomerName(event)}
                          </p>
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
      </div>
    </div>
  );
}