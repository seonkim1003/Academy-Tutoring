import { useMemo, useState } from "react";
import { clsx } from "clsx";
import { DAYS_OF_WEEK, TIME_SLOTS } from "@academy/shared";
import { Button } from "../ui/Button";

type Slot = { dayOfWeek: number; startMinute: number; endMinute: number };

type Props = {
  value: Slot[];
  onChange: (slots: Slot[]) => void;
  error?: string;
};

type WindowGroup = {
  days: number[];
  startMinute: number;
  endMinute: number;
};

const DAY_ABBREV: Record<number, string> = {
  0: "Sun",
  1: "Mon",
  2: "Tue",
  3: "Wed",
  4: "Thu",
  5: "Fri",
  6: "Sat",
};

export function AvailabilityPicker({ value, onChange, error }: Props) {
  const [selectedDays, setSelectedDays] = useState<Set<number>>(new Set());
  const [from, setFrom] = useState<number>(15 * 60); // 3:00 PM
  const [to, setTo] = useState<number>(17 * 60); // 5:00 PM

  const toggleDay = (d: number) => {
    const next = new Set(selectedDays);
    if (next.has(d)) next.delete(d);
    else next.add(d);
    setSelectedDays(next);
  };

  const canAdd = selectedDays.size > 0 && from < to;

  const handleAdd = () => {
    if (!canAdd) return;
    const additions: Slot[] = [...selectedDays].map((d) => ({
      dayOfWeek: d,
      startMinute: from,
      endMinute: to,
    }));
    // De-dupe against existing slots (same day + range)
    const filtered = additions.filter(
      (a) =>
        !value.some(
          (s) =>
            s.dayOfWeek === a.dayOfWeek &&
            s.startMinute === a.startMinute &&
            s.endMinute === a.endMinute
        )
    );
    onChange([...value, ...filtered]);
    setSelectedDays(new Set());
  };

  const handleFromChange = (newFrom: number) => {
    setFrom(newFrom);
    if (newFrom >= to) {
      // Bump `to` to the next 30-min slot after `from`
      const next = TIME_SLOTS.find((s) => s.value > newFrom);
      if (next) setTo(next.value);
    }
  };

  const grouped: WindowGroup[] = useMemo(() => {
    const map = new Map<string, WindowGroup>();
    for (const s of value) {
      const key = `${s.startMinute}-${s.endMinute}`;
      const existing = map.get(key);
      if (existing) existing.days.push(s.dayOfWeek);
      else
        map.set(key, {
          days: [s.dayOfWeek],
          startMinute: s.startMinute,
          endMinute: s.endMinute,
        });
    }
    return [...map.values()]
      .map((g) => ({ ...g, days: [...g.days].sort((a, b) => a - b) }))
      .sort(
        (a, b) =>
          a.startMinute - b.startMinute || a.endMinute - b.endMinute
      );
  }, [value]);

  const removeGroup = (g: WindowGroup) => {
    onChange(
      value.filter(
        (s) =>
          !(
            s.startMinute === g.startMinute &&
            s.endMinute === g.endMinute &&
            g.days.includes(s.dayOfWeek)
          )
      )
    );
  };

  const toOptions = TIME_SLOTS.filter((s) => s.value > from);
  const totalDays = new Set(value.map((s) => s.dayOfWeek)).size;

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium text-gray-700">
          Availability <span className="text-red-500">*</span>
        </label>
        <p className="text-xs text-gray-500">
          Pick the days, choose a time range, and click Add. Add multiple windows
          if your schedule varies week to week.
        </p>
      </div>

      {/* Day chips — multi-select */}
      <div className="flex flex-wrap gap-1.5">
        {DAYS_OF_WEEK.map((d) => {
          const active = selectedDays.has(d.value);
          return (
            <button
              key={d.value}
              type="button"
              onClick={() => toggleDay(d.value)}
              className={clsx(
                "rounded-full px-3 py-1 text-xs font-medium transition border",
                active
                  ? "bg-blue-600 text-white border-blue-600"
                  : "bg-gray-100 text-gray-700 border-gray-200 hover:bg-gray-200"
              )}
            >
              {d.label.slice(0, 3)}
            </button>
          );
        })}
      </div>

      {/* Time range + Add */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end">
        <div className="flex flex-1 gap-2">
          <label className="flex flex-1 flex-col gap-1 text-xs text-gray-600">
            From
            <select
              value={from}
              onChange={(e) => handleFromChange(Number(e.target.value))}
              className="rounded-md border border-gray-300 bg-white px-2 py-1.5 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {TIME_SLOTS.slice(0, -1).map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>
          </label>
          <label className="flex flex-1 flex-col gap-1 text-xs text-gray-600">
            To
            <select
              value={to}
              onChange={(e) => setTo(Number(e.target.value))}
              className="rounded-md border border-gray-300 bg-white px-2 py-1.5 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {toOptions.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>
          </label>
        </div>
        <Button
          type="button"
          size="md"
          onClick={handleAdd}
          disabled={!canAdd}
          className="sm:w-auto"
        >
          + Add
        </Button>
      </div>

      {/* Saved windows */}
      <div className="flex flex-col gap-1">
        <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
          Your availability
        </p>
        {grouped.length === 0 ? (
          <p className="text-xs italic text-gray-400">
            No availability added yet.
          </p>
        ) : (
          <ul className="flex flex-col divide-y divide-gray-100 rounded-md border border-gray-200 bg-white">
            {grouped.map((g, i) => (
              <li
                key={i}
                className="flex items-center justify-between gap-2 px-3 py-2 text-sm text-gray-800"
              >
                <span>
                  <span className="font-medium">
                    {g.days.map((d) => DAY_ABBREV[d]).join(", ")}
                  </span>
                  {" — "}
                  {formatTime(g.startMinute)} to {formatTime(g.endMinute)}
                </span>
                <button
                  type="button"
                  onClick={() => removeGroup(g)}
                  aria-label="Remove window"
                  className="rounded-full p-1 text-gray-400 hover:bg-red-50 hover:text-red-600"
                >
                  <svg
                    className="h-4 w-4"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>
              </li>
            ))}
          </ul>
        )}
        {value.length > 0 && (
          <p className="text-xs text-green-600">
            Total: {value.length} slot{value.length !== 1 ? "s" : ""} across{" "}
            {totalDays} day{totalDays !== 1 ? "s" : ""}
          </p>
        )}
      </div>

      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
}

function formatTime(min: number): string {
  const h = Math.floor(min / 60);
  const m = min % 60;
  const ampm = h < 12 ? "AM" : "PM";
  const dh = h > 12 ? h - 12 : h === 0 ? 12 : h;
  return `${dh}:${m.toString().padStart(2, "0")} ${ampm}`;
}
