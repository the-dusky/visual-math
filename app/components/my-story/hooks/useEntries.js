"use client";
import { useCallback } from "react";
import { useLocalStorage } from "./useLocalStorage";
import { STORAGE_KEYS, todayKey } from "../constants";

export function useEntries() {
  const [entries, setEntries] = useLocalStorage(STORAGE_KEYS.ENTRIES, []);

  const upsertEntry = useCallback((classId, sentence, dateOverride) => {
    const date = dateOverride || todayKey();
    setEntries((prev) => {
      const idx = prev.findIndex((e) => e.classId === classId && e.date === date);
      if (idx >= 0) {
        const updated = [...prev];
        updated[idx] = { ...updated[idx], sentence: sentence.trim(), createdAt: new Date().toISOString() };
        return updated;
      }
      return [
        ...prev,
        {
          id: crypto.randomUUID(),
          classId,
          date,
          sentence: sentence.trim(),
          createdAt: new Date().toISOString(),
        },
      ];
    });
  }, [setEntries]);

  const getEntryForToday = useCallback((classId) => {
    const date = todayKey();
    return entries.find((e) => e.classId === classId && e.date === date) || null;
  }, [entries]);

  const getEntriesForClass = useCallback((classId) => {
    return entries
      .filter((e) => e.classId === classId)
      .sort((a, b) => b.date.localeCompare(a.date));
  }, [entries]);

  const updateEntryPhotos = useCallback((classId, photos) => {
    const date = todayKey();
    setEntries((prev) => {
      const idx = prev.findIndex((e) => e.classId === classId && e.date === date);
      if (idx >= 0) {
        const updated = [...prev];
        updated[idx] = { ...updated[idx], photos };
        return updated;
      }
      // Create entry with photos but no sentence yet
      return [
        ...prev,
        {
          id: crypto.randomUUID(),
          classId,
          date,
          sentence: "",
          photos,
          createdAt: new Date().toISOString(),
        },
      ];
    });
  }, [setEntries]);

  const deleteEntriesForClass = useCallback((classId) => {
    setEntries((prev) => prev.filter((e) => e.classId !== classId));
  }, [setEntries]);

  return { entries, setEntries, upsertEntry, getEntryForToday, getEntriesForClass, deleteEntriesForClass, updateEntryPhotos };
}
