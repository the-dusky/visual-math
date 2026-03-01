"use client";

export function TimelineEntry({ entry, cls, showClassName }) {
  return (
    <div className="flex items-start gap-3 py-2">
      {/* Color dot */}
      <span
        className="block w-3 h-3 rounded-full flex-shrink-0 mt-1"
        style={{ backgroundColor: cls?.color || "#71717a" }}
      />

      <div className="min-w-0 flex-1">
        {showClassName && (
          <p className="text-[11px] text-text-faint font-semibold mb-0.5">{cls?.name}</p>
        )}
        <p className="text-sm text-text-secondary">{entry.sentence}</p>

        {/* Photo thumbnails */}
        {entry.photos?.length > 0 && (
          <div className="flex gap-1.5 mt-1.5">
            {entry.photos.map((url, i) => (
              <img
                key={url}
                src={url}
                alt={`Photo ${i + 1}`}
                className="w-12 h-12 rounded object-cover border border-border"
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
