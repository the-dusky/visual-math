"use client";
import { useMemo } from "react";
import { ClassCard } from "../ui/ClassCard";
import { todayKey, formatDate } from "../constants";

export function TodayMode({ classes, entries }) {
  const { activeClasses } = classes;
  const { entries: allEntries, upsertEntry, getEntryForToday, updateEntryPhotos } = entries;
  const today = todayKey();

  const classesWithStatus = useMemo(() => {
    return activeClasses.map((cls) => ({
      cls,
      entry: allEntries.find((e) => e.classId === cls.id && e.date === today) || null,
    }));
  }, [activeClasses, allEntries, today]);

  const completedCount = classesWithStatus.filter((c) => !!c.entry?.sentence).length;
  const totalCount = classesWithStatus.length;
  const allDone = totalCount > 0 && completedCount === totalCount;

  return (
    <div className="space-y-4">
      {/* Date + progress */}
      <div className="text-center mb-2">
        <p className="text-sm text-text-muted">{formatDate(today)}</p>
        <p className={`text-xs font-bold mt-1 ${allDone ? "text-ok-text" : "text-text-faint"}`}>
          {totalCount === 0
            ? "No classes yet"
            : allDone
              ? "All done!"
              : `${completedCount} of ${totalCount} done`}
        </p>
      </div>

      {/* Progress bar */}
      {totalCount > 0 && (
        <div className="flex h-2 rounded-full overflow-hidden bg-surface-overlay">
          {classesWithStatus.map(({ cls, entry }) => (
            <div
              key={cls.id}
              className="transition-all duration-500"
              style={{
                flex: 1,
                backgroundColor: entry?.sentence ? cls.color : "transparent",
                opacity: entry?.sentence ? 1 : 0.15,
              }}
            />
          ))}
        </div>
      )}

      {/* Class cards */}
      {classesWithStatus.map(({ cls, entry }) => (
        <ClassCard
          key={cls.id}
          cls={cls}
          entry={entry}
          onSave={upsertEntry}
          onUpdatePhotos={updateEntryPhotos}
        />
      ))}

      {/* Empty state */}
      {totalCount === 0 && (
        <div className="text-center py-8">
          <p className="text-text-muted text-sm">
            Switch to Setup to add your classes first
          </p>
        </div>
      )}
    </div>
  );
}
