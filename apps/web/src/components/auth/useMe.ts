import { useQuery } from "@tanstack/react-query";
import { api } from "../../lib/api";

export type Me = {
  user: {
    id: number;
    email: string;
    name: string;
    picture: string | null;
  };
  roles: { isTutor: boolean; isTutee: boolean };
  pendingClaim: boolean;
};

export function useMe() {
  return useQuery({
    queryKey: ["me"],
    queryFn: async () => {
      const res = await api.get<Me>("/auth/me");
      if (!res.success) throw new Error(res.error);
      return res.data;
    },
    retry: false,
    staleTime: 30_000,
  });
}
