import { useState } from "react";
import { clsx } from "clsx";
import { DAYS_OF_WEEK, TIME_SLOTS } from "@academy/shared";

type Slot = { dayOfWeek: number; startMinute: number; endMinute: number };

type Props = {
  value: Slot[];
  onChange: (slots: Slot[]) => void;
  error?: string;
};

export function AvailabilityPicker({ value, onChange, error }: Props) {
  const [selectedDay, setSelectedDay] = useState<number>(1); // Monday default

  const toggleSlot = (startMinute: number) => {
    const endMinute = startMinute + 60; // 1-hour slots
    const exists = value.some(
      (s) => s.dayOfWeek === selectedDay && s.startMinute === startMinute
    );
    if (exists) {
      onChange(
        value.filter(
          (s) => !(s.dayOfWeek === selectedDay && s.startMinute === startMinute)
        )
      );
    } else {
      onChange([...value, { dayOfWeek: selectedDay, startMinute, endMinute }]);
    }
  };

  const isSelected = (startMinute: number) =>
    value.some((s) => s.dayOfWeek === selectedDay && s.startMinute === startMinute);

  const slotsByDay = DAYS_OF_WEEK.map((d) => ({
    ...d,
    count: value.filter((s) => s.dayOfWeek === d.value).length,
  }));

  return (
    <div className="flex flex-col gap-2">
      <label className="text-sm font-medium text-gray-700">
        Availability <span className="text-red-500">*</span>
      </label>
      <p className="text-xs text-gray-500">Select all times you're generally available each week.</p>

      {/* Day selector */}
      <div className="flex flex-wrap gap-1.5">
        {slotsByDay.map((d) => (
          <button
            key={d.value}
            type="button"
            onClick={() => setSelectedDay(d.value)}
            className={clsx(
              "rounded-full px-3 py-1 text-xs font-medium transition",
              selectedDay === d.value
                ? "bg-blue-600 text-white"
                : d.count > 0
                ? "bg-blue-100 text-blue-700 border border-blue-200"
                : "bg-gray-100 text-gray-600 border border-gray-200 hover:bg-gray-200"
            )}
          >
            {d.label.slice(0, 3)}
            {d.count > 0 && ` (${d.count})`}
          </button>
        ))}
      </div>

      {/* Time slots for selected day */}
      <div className="grid grid-cols-3 gap-1.5 sm:grid-cols-4">
        {TIME_SLOTS.filter((_, i) => i % 2 === 0).map((slot) => (
          <button
            key={slot.value}
            type="button"
            onClick={() => toggleSlot(slot.value)}
            className={clsx(
              "rounded px-2 py-1.5 text-xs font-medium border transition",
              isSelected(slot.value)
                ? "bg-blue-600 text-white border-blue-600"
                : "bg-white text-gray-700 border-gray-200 hover:border-blue-300 hover:bg-blue-50"
            )}
          >
            {slot.label}
          </button>
        ))}
      </div>

      {value.length > 0 && (
        <p className="text-xs text-green-600">
          {value.length} slot{value.length !== 1 ? "s" : ""} selected across {new Set(value.map((s) => s.dayOfWeek)).size} day{new Set(value.map((s) => s.dayOfWeek)).size !== 1 ? "s" : ""}
        </p>
      )}
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
}
