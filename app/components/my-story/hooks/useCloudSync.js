"use client";
import { useEffect, useRef, useCallback, useState } from "react";

const SYNC_DEBOUNCE_MS = 500;

export function useCloudSync(classesHook, entriesHook) {
  const [syncing, setSyncing] = useState(false);
  const [lastSynced, setLastSynced] = useState(null);
  const [available, setAvailable] = useState(true);
  const loaded = useRef(false);
  const timer = useRef(null);

  const { classes, setClasses } = classesHook;
  const { entries, setEntries } = entriesHook;

  // Fetch from cloud on mount
  useEffect(() => {
    let cancelled = false;

    async function pull() {
      try {
        const res = await fetch("/api/story");
        if (res.status === 501) {
          setAvailable(false);
          loaded.current = true;
          return;
        }
        if (!res.ok) {
          loaded.current = true;
          return;
        }

        const data = await res.json();
        if (cancelled) return;

        // Only overwrite if cloud has data
        if (data.classes?.length) setClasses(data.classes);
        if (data.entries?.length) setEntries(data.entries);
        setLastSynced(new Date());
      } catch {
        // Network error — localStorage still works
      }
      loaded.current = true;
    }

    pull();
    return () => { cancelled = true; };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Push to cloud on changes (debounced)
  const push = useCallback(async (cls, ent) => {
    if (!available) return;

    setSyncing(true);
    try {
      const res = await fetch("/api/story", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ classes: cls, entries: ent }),
      });
      if (res.status === 501) {
        setAvailable(false);
      } else if (res.ok) {
        setLastSynced(new Date());
      }
    } catch {
      // Silently fail — localStorage has the data
    }
    setSyncing(false);
  }, [available]);

  // Watch for changes and debounce sync
  useEffect(() => {
    if (!loaded.current) return; // Don't sync the initial load back
    if (!available) return;

    clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      push(classes, entries);
    }, SYNC_DEBOUNCE_MS);

    return () => clearTimeout(timer.current);
  }, [classes, entries, push, available]);

  return { syncing, lastSynced, available };
}
