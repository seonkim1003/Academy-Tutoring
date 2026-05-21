import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "../../lib/api";
const POLL_MS = 30000;
function userNotificationsQuery() {
    return {
        queryKey: ["me", "notifications"],
        queryFn: async () => {
            const res = await api.get("/me/notifications");
            if (!res.success)
                throw new Error(res.error);
            return res.data;
        },
        refetchInterval: POLL_MS,
        refetchIntervalInBackground: false,
    };
}
function adminNotificationsQuery() {
    return {
        queryKey: ["admin", "notifications"],
        queryFn: async () => {
            const res = await api.get("/admin/notifications");
            if (!res.success)
                throw new Error(res.error);
            return res.data;
        },
        refetchInterval: POLL_MS,
        refetchIntervalInBackground: false,
    };
}
export function useNotifications(enabled = true) {
    return useQuery({
        ...userNotificationsQuery(),
        enabled,
    });
}
export function useAdminNotifications(enabled = true) {
    return useQuery({
        ...adminNotificationsQuery(),
        enabled,
    });
}
export function useMarkNotificationRead(variant = "user") {
    const qc = useQueryClient();
    const prefix = variant === "user" ? "/me" : "/admin";
    const queryKey = variant === "user" ? ["me", "notifications"] : ["admin", "notifications"];
    return useMutation({
        mutationFn: (id) => api.post(`${prefix}/notifications/${id}/read`, {}),
        onSuccess: () => qc.invalidateQueries({ queryKey }),
    });
}
export function useMarkAllNotificationsRead(variant = "user") {
    const qc = useQueryClient();
    const prefix = variant === "user" ? "/me" : "/admin";
    const queryKey = variant === "user" ? ["me", "notifications"] : ["admin", "notifications"];
    return useMutation({
        mutationFn: () => api.post(`${prefix}/notifications/read-all`, {}),
        onSuccess: () => qc.invalidateQueries({ queryKey }),
    });
}
export function invalidateUserNotifications(qc) {
    return qc.invalidateQueries({ queryKey: ["me", "notifications"] });
}
