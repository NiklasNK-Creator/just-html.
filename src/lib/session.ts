import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { getMyContext } from "@/lib/posts.functions";
import type { Session } from "@supabase/supabase-js";

export function useSession() {
  const [session, setSession] = useState<Session | null | undefined>(undefined);
  useEffect(() => {
    let mounted = true;
    supabase.auth.getSession().then(({ data }) => {
      if (mounted) setSession(data.session);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => setSession(s));
    return () => {
      mounted = false;
      sub.subscription.unsubscribe();
    };
  }, []);
  return session;
}

export function useMe() {
  const session = useSession();
  const fetchCtx = useServerFn(getMyContext);
  return useQuery({
    queryKey: ["me", session?.user.id ?? null],
    queryFn: () => fetchCtx({ data: undefined as never }),
    enabled: !!session?.user,
    staleTime: 60_000,
  });
}

export function useAuthActions() {
  const qc = useQueryClient();
  return {
    signOut: async () => {
      await supabase.auth.signOut();
      qc.invalidateQueries();
    },
  };
}
