import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useMemo, useState } from "react";
import { clsx } from "clsx";
import { DAYS_OF_WEEK, TIME_SLOTS } from "@academy/shared";
import { Button } from "../ui/Button";
import { formatTime } from "../../lib/format";
const DAY_ABBREV = {
    0: "Sun",
    1: "Mon",
    2: "Tue",
    3: "Wed",
    4: "Thu",
    5: "Fri",
    6: "Sat",
};
export function AvailabilityPicker({ value, onChange, error }) {
    const [selectedDays, setSelectedDays] = useState(new Set());
    const [from, setFrom] = useState(15 * 60); // 3:00 PM
    const [to, setTo] = useState(17 * 60); // 5:00 PM
    const toggleDay = (d) => {
        const next = new Set(selectedDays);
        if (next.has(d))
            next.delete(d);
        else
            next.add(d);
        setSelectedDays(next);
    };
    const canAdd = selectedDays.size > 0 && from < to;
    const handleAdd = () => {
        if (!canAdd)
            return;
        const additions = [...selectedDays].map((d) => ({
            dayOfWeek: d,
            startMinute: from,
            endMinute: to,
        }));
        // De-dupe against existing slots (same day + range)
        const filtered = additions.filter((a) => !value.some((s) => s.dayOfWeek === a.dayOfWeek &&
            s.startMinute === a.startMinute &&
            s.endMinute === a.endMinute));
        onChange([...value, ...filtered]);
        setSelectedDays(new Set());
    };
    const handleFromChange = (newFrom) => {
        setFrom(newFrom);
        if (newFrom >= to) {
            // Bump `to` to the next 30-min slot after `from`
            const next = TIME_SLOTS.find((s) => s.value > newFrom);
            if (next)
                setTo(next.value);
        }
    };
    const grouped = useMemo(() => {
        const map = new Map();
        for (const s of value) {
            const key = `${s.startMinute}-${s.endMinute}`;
            const existing = map.get(key);
            if (existing)
                existing.days.push(s.dayOfWeek);
            else
                map.set(key, {
                    days: [s.dayOfWeek],
                    startMinute: s.startMinute,
                    endMinute: s.endMinute,
                });
        }
        return [...map.values()]
            .map((g) => ({ ...g, days: [...g.days].sort((a, b) => a - b) }))
            .sort((a, b) => a.startMinute - b.startMinute || a.endMinute - b.endMinute);
    }, [value]);
    const removeGroup = (g) => {
        onChange(value.filter((s) => !(s.startMinute === g.startMinute &&
            s.endMinute === g.endMinute &&
            g.days.includes(s.dayOfWeek))));
    };
    const toOptions = TIME_SLOTS.filter((s) => s.value > from);
    const totalDays = new Set(value.map((s) => s.dayOfWeek)).size;
    return (_jsxs("div", { className: "flex flex-col gap-3", children: [_jsxs("div", { className: "flex flex-col gap-1", children: [_jsxs("label", { className: "text-sm font-medium text-gray-700", children: ["Availability ", _jsx("span", { className: "text-red-500", children: "*" })] }), _jsx("p", { className: "text-xs text-gray-500", children: "Pick the days, choose a time range, and click Add. Add multiple windows if your schedule varies week to week." })] }), _jsx("div", { className: "flex flex-wrap gap-1.5", children: DAYS_OF_WEEK.map((d) => {
                    const active = selectedDays.has(d.value);
                    return (_jsx("button", { type: "button", onClick: () => toggleDay(d.value), className: clsx("rounded-full px-3 py-1 text-xs font-medium transition border", active
                            ? "bg-blue-600 text-white border-blue-600"
                            : "bg-gray-100 text-gray-700 border-gray-200 hover:bg-gray-200"), children: d.label.slice(0, 3) }, d.value));
                }) }), _jsxs("div", { className: "flex flex-col gap-2 sm:flex-row sm:items-end", children: [_jsxs("div", { className: "flex flex-1 gap-2", children: [_jsxs("label", { className: "flex flex-1 flex-col gap-1 text-xs text-gray-600", children: ["From", _jsx("select", { value: from, onChange: (e) => handleFromChange(Number(e.target.value)), className: "rounded-md border border-gray-300 bg-white px-2 py-1.5 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500", children: TIME_SLOTS.slice(0, -1).map((s) => (_jsx("option", { value: s.value, children: s.label }, s.value))) })] }), _jsxs("label", { className: "flex flex-1 flex-col gap-1 text-xs text-gray-600", children: ["To", _jsx("select", { value: to, onChange: (e) => setTo(Number(e.target.value)), className: "rounded-md border border-gray-300 bg-white px-2 py-1.5 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500", children: toOptions.map((s) => (_jsx("option", { value: s.value, children: s.label }, s.value))) })] })] }), _jsx(Button, { type: "button", size: "md", onClick: handleAdd, disabled: !canAdd, className: "sm:w-auto", children: "+ Add" })] }), _jsxs("div", { className: "flex flex-col gap-1", children: [_jsx("p", { className: "text-xs font-medium uppercase tracking-wide text-gray-500", children: "Your availability" }), grouped.length === 0 ? (_jsx("p", { className: "text-xs italic text-gray-400", children: "No availability added yet." })) : (_jsx("ul", { className: "flex flex-col divide-y divide-gray-100 rounded-md border border-gray-200 bg-white", children: grouped.map((g, i) => (_jsxs("li", { className: "flex items-center justify-between gap-2 px-3 py-2 text-sm text-gray-800", children: [_jsxs("span", { children: [_jsx("span", { className: "font-medium", children: g.days.map((d) => DAY_ABBREV[d]).join(", ") }), " — ", formatTime(g.startMinute), " to ", formatTime(g.endMinute)] }), _jsx("button", { type: "button", onClick: () => removeGroup(g), "aria-label": "Remove window", className: "rounded-full p-1 text-gray-400 hover:bg-red-50 hover:text-red-600", children: _jsx("svg", { className: "h-4 w-4", viewBox: "0 0 20 20", fill: "currentColor", children: _jsx("path", { fillRule: "evenodd", d: "M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z", clipRule: "evenodd" }) }) })] }, i))) })), value.length > 0 && (_jsxs("p", { className: "text-xs text-green-600", children: ["Total: ", value.length, " slot", value.length !== 1 ? "s" : "", " across", " ", totalDays, " day", totalDays !== 1 ? "s" : ""] }))] }), error && _jsx("p", { className: "text-xs text-red-600", children: error })] }));
}
