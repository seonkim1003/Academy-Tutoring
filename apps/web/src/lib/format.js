import { DAYS_OF_WEEK } from "@academy/shared";
export function formatTime(min) {
    const h24 = Math.floor(min / 60) % 24;
    const m = min % 60;
    const ampm = h24 < 12 ? "AM" : "PM";
    const dh = h24 % 12 === 0 ? 12 : h24 % 12;
    return `${dh}:${m.toString().padStart(2, "0")} ${ampm}`;
}
export function dayLabel(d) {
    return DAYS_OF_WEEK.find((x) => x.value === d)?.label ?? `Day ${d}`;
}
export function formatDate(unix) {
    return new Date(unix * 1000).toLocaleDateString(undefined, {
        year: "numeric",
        month: "short",
        day: "numeric",
    });
}
export const MATCH_STATUS_COLORS = {
    proposed: "bg-amber-50 text-amber-700 border-amber-200",
    accepted: "bg-green-50 text-green-700 border-green-200",
    declined: "bg-gray-100 text-gray-600 border-gray-200",
    expired: "bg-gray-100 text-gray-500 border-gray-200",
    cancelled: "bg-gray-100 text-gray-500 border-gray-200",
    completed: "bg-blue-50 text-blue-700 border-blue-200",
};
export const REQUEST_STATUS_COLORS = {
    pending: "bg-amber-50 text-amber-700 border-amber-200",
    matched: "bg-green-50 text-green-700 border-green-200",
    cancelled: "bg-gray-100 text-gray-500 border-gray-200",
    expired: "bg-gray-100 text-gray-500 border-gray-200",
};
export function statusChipClass(status, colors) {
    return (colors[status] ?? "bg-gray-100 text-gray-600 border-gray-200");
}
