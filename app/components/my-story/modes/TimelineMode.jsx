"use client";
import { useState, useMemo } from "react";
import { ClassPill } from "../ui/ClassPill";
import { TimelineEntry } from "../ui/TimelineEntry";
import { EntryDetail } from "../ui/EntryDetail";
import { formatDate } from "../constants";

export function TimelineMode({ classes, entries }) {
  const { activeClasses } = classes;
  const { entries: allEntries, upsertEntry, updateEntryPhotos } = entries;
  const [selectedClassId, setSelectedClassId] = useState(null);
  const [detailEntry, setDetailEntry] = useState(null);

  const classMap = useMemo(() => {
    const map = {};
    activeClasses.forEach((c) => { map[c.id] = c; });
    return map;
  }, [activeClasses]);

  // Filter entries by selected class and only include active classes
  const activeIds = useMemo(() => new Set(activeClasses.map((c) => c.id)), [activeClasses]);

  const filtered = useMemo(() => {
    return allEntries
      .filter((e) => activeIds.has(e.classId))
      .filter((e) => !selectedClassId || e.classId === selectedClassId)
      .sort((a, b) => b.date.localeCompare(a.date) || b.createdAt.localeCompare(a.createdAt));
  }, [allEntries, selectedClassId, activeIds]);

  // Group by date
  const grouped = useMemo(() => {
    const groups = [];
    let currentDate = null;
    let currentGroup = null;
    for (const entry of filtered) {
      if (entry.date !== currentDate) {
        currentDate = entry.date;
        currentGroup = { date: currentDate, entries: [] };
        groups.push(currentGroup);
      }
      currentGroup.entries.push(entry);
    }
    return groups;
  }, [filtered]);

  const showClassName = !selectedClassId;

  return (
    <div className="space-y-4">
      {/* Class filter pills */}
      <div className="flex gap-1.5 overflow-x-auto pb-1" style={{ WebkitOverflowScrolling: "touch" }}>
        <ClassPill
          label="All"
          color="#8b5cf6"
          selected={!selectedClassId}
          onClick={() => setSelectedClassId(null)}
        />
        {activeClasses.map((cls) => (
          <ClassPill
            key={cls.id}
            label={cls.name}
            color={cls.color}
            selected={selectedClassId === cls.id}
            onClick={() => setSelectedClassId(cls.id)}
          />
        ))}
      </div>

      {/* Timeline */}
      {grouped.length > 0 ? (
        <div className="space-y-4">
          {grouped.map((group) => (
            <div key={group.date}>
              {/* Date header */}
              <div className="sticky top-0 bg-surface z-10 py-1">
                <p className="text-xs font-bold text-text-faint">
                  {formatDate(group.date)}
                </p>
              </div>

              {/* Entries for this date */}
              <div className="border-l-2 border-border ml-1.5 pl-3 space-y-1">
                {group.entries.map((entry) => (
                  <TimelineEntry
                    key={entry.id}
                    entry={entry}
                    cls={classMap[entry.classId]}
                    showClassName={showClassName}
                    onOpenDetail={setDetailEntry}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8">
          <p className="text-text-muted text-sm">
            {activeClasses.length === 0
              ? "Add classes in Setup first"
              : "No entries yet. Start writing in Today!"}
          </p>
        </div>
      )}

      {/* Entry detail modal */}
      {detailEntry && (
        <EntryDetail
          entry={detailEntry}
          cls={classMap[detailEntry.classId]}
          onSave={upsertEntry}
          onUpdatePhotos={updateEntryPhotos}
          onClose={() => setDetailEntry(null)}
        />
      )}
    </div>
  );
}
