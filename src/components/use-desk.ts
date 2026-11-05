import { useEffect, useState } from "react";
import { useStudy } from "@/lib/study/store";

export function useDeskReady(): boolean {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let live = true;
    const done = () => {
      if (live) setReady(true);
    };
    if (useStudy.persist.hasHydrated()) done();
    const unsub = useStudy.persist.onFinishHydration(done);
    void useStudy.persist.rehydrate();
    return () => {
      live = false;
      unsub();
    };
  }, []);

  return ready;
}
