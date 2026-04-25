import type { CalendarEvent } from "@/lib/events/get-events-for-month";

type Department = NonNullable<
  NonNullable<CalendarEvent["users"]>["departments"]
>;

type Props = {
  events: CalendarEvent[];
};

function isDepartment(department: Department | null | undefined): department is Department {
  return Boolean(department);
}

export default function DepartmentLegend({ events }: Props) {
  const departments = Array.from(
    new Map(
      events
        .map((event) => event.users?.departments)
        .filter(isDepartment)
        .map((department) => [department.id, department])
    ).values()
  ).sort((a, b) => a.name.localeCompare(b.name, "de-CH"));

  if (departments.length === 0) {
    return null;
  }

  return (
    <div className="mt-3 border-t border-[var(--color-border)] pt-3">
      <div className="flex flex-wrap items-center gap-2">
        <span className="mr-1 text-xs font-semibold text-[var(--color-text-muted)]">
          Legende:
        </span>

        {departments.map((department) => (
          <span
            key={department.id}
            className="inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium"
            style={{
              backgroundColor: `${department.color}14`,
              borderColor: `${department.color}55`,
              color: department.color,
            }}
          >
            <span
              className="h-2 w-2 rounded-full"
              style={{ backgroundColor: department.color }}
              aria-hidden="true"
            />
            {department.name}
          </span>
        ))}
      </div>
    </div>
  );
}