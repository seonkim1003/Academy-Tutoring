import { useQuery } from "@tanstack/react-query";
import { api } from "../../lib/api";
export function useMe() {
    return useQuery({
        queryKey: ["me"],
        queryFn: async () => {
            const res = await api.get("/auth/me");
            if (!res.success)
                throw new Error(res.error);
            return res.data;
        },
        retry: false,
        staleTime: 30000,
    });
}
