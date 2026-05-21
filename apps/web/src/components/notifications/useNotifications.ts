import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "../../lib/api";

export type NotificationItem = {
  id: number;
  type: string;
  title: string;
  body: string;
  metadata: Record<string, unknown> | null;
  targetUrl: string;
  readAt: number | null;
  createdAt: number;
};

export type NotificationsData = {
  items: NotificationItem[];
  unreadCount: number;
  nextCursor: string | null;
};

const POLL_MS = 30_000;

function userNotificationsQuery() {
  return {
    queryKey: ["me", "notifications"] as const,
    queryFn: async () => {
      const res = await api.get<NotificationsData>("/me/notifications");
      if (!res.success) throw new Error(res.error);
      return res.data;
    },
    refetchInterval: POLL_MS,
    refetchIntervalInBackground: false,
  };
}

function adminNotificationsQuery() {
  return {
    queryKey: ["admin", "notifications"] as const,
    queryFn: async () => {
      const res = await api.get<NotificationsData>("/admin/notifications");
      if (!res.success) throw new Error(res.error);
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

export function useMarkNotificationRead(variant: "user" | "admin" = "user") {
  const qc = useQueryClient();
  const prefix = variant === "user" ? "/me" : "/admin";
  const queryKey = variant === "user" ? ["me", "notifications"] : ["admin", "notifications"];

  return useMutation({
    mutationFn: (id: number) => api.post(`${prefix}/notifications/${id}/read`, {}),
    onSuccess: () => qc.invalidateQueries({ queryKey }),
  });
}

export function useMarkAllNotificationsRead(variant: "user" | "admin" = "user") {
  const qc = useQueryClient();
  const prefix = variant === "user" ? "/me" : "/admin";
  const queryKey = variant === "user" ? ["me", "notifications"] : ["admin", "notifications"];

  return useMutation({
    mutationFn: () => api.post(`${prefix}/notifications/read-all`, {}),
    onSuccess: () => qc.invalidateQueries({ queryKey }),
  });
}

export function invalidateUserNotifications(qc: ReturnType<typeof useQueryClient>) {
  return qc.invalidateQueries({ queryKey: ["me", "notifications"] });
}
