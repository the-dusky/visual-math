"use client";
import { useCallback } from "react";
import { useLocalStorage } from "./useLocalStorage";
import { STORAGE_KEYS } from "../constants";

export function useClasses() {
  const [classes, setClasses] = useLocalStorage(STORAGE_KEYS.CLASSES, []);

  const addClass = useCallback((name, color) => {
    const newClass = {
      id: crypto.randomUUID(),
      name: name.trim(),
      color,
      createdAt: new Date().toISOString(),
      archived: false,
    };
    setClasses((prev) => [...prev, newClass]);
    return newClass;
  }, [setClasses]);

  const updateClass = useCallback((id, updates) => {
    setClasses((prev) => prev.map((c) => (c.id === id ? { ...c, ...updates } : c)));
  }, [setClasses]);

  const deleteClass = useCallback((id) => {
    setClasses((prev) => prev.filter((c) => c.id !== id));
  }, [setClasses]);

  const archiveAll = useCallback(() => {
    setClasses((prev) => prev.map((c) => ({ ...c, archived: true })));
  }, [setClasses]);

  const activeClasses = classes.filter((c) => !c.archived);
  const archivedClasses = classes.filter((c) => c.archived);

  return { classes, setClasses, activeClasses, archivedClasses, addClass, updateClass, deleteClass, archiveAll };
}
