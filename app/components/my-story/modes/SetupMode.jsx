"use client";
import { useState } from "react";
import { ColorPicker } from "../ui/ColorPicker";
import { CLASS_COLORS } from "../constants";

export function SetupMode({ classes, entries }) {
  const { activeClasses, archivedClasses, addClass, updateClass, deleteClass, archiveAll } = classes;
  const { deleteEntriesForClass } = entries;

  const [name, setName] = useState("");
  const [color, setColor] = useState(CLASS_COLORS[0]);
  const [error, setError] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState("");
  const [editColor, setEditColor] = useState("");
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [confirmArchive, setConfirmArchive] = useState(false);

  function handleAdd() {
    const trimmed = name.trim();
    if (!trimmed) {
      setError("Enter a class name");
      return;
    }
    if (activeClasses.some((c) => c.name.toLowerCase() === trimmed.toLowerCase())) {
      setError("Class already exists");
      return;
    }
    addClass(trimmed, color);
    setName("");
    setError("");
    // Pick next unused color
    const usedColors = new Set(activeClasses.map((c) => c.color));
    usedColors.add(color);
    const next = CLASS_COLORS.find((c) => !usedColors.has(c));
    if (next) setColor(next);
  }

  function startEdit(cls) {
    setEditingId(cls.id);
    setEditName(cls.name);
    setEditColor(cls.color);
  }

  function saveEdit() {
    if (!editName.trim()) return;
    updateClass(editingId, { name: editName.trim(), color: editColor });
    setEditingId(null);
  }

  function handleDelete(id) {
    deleteClass(id);
    deleteEntriesForClass(id);
    setConfirmDelete(null);
  }

  function handleArchive() {
    archiveAll();
    setConfirmArchive(false);
  }

  return (
    <div className="space-y-6">
      {/* Add new class */}
      <div className="bg-surface-raised border border-border rounded-xl p-4 space-y-3">
        <h3 className="text-sm font-bold text-text-secondary">Add a class</h3>
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={name}
            onChange={(e) => { setName(e.target.value); setError(""); }}
            onKeyDown={(e) => { if (e.key === "Enter") handleAdd(); }}
            placeholder="Class name"
            className="flex-1 h-10 rounded-lg border border-border bg-surface text-text text-sm font-semibold outline-none px-3 focus:border-border-strong"
          />
          <button
            onClick={handleAdd}
            className="px-4 py-2.5 rounded-lg border-none bg-cta text-surface font-bold cursor-pointer text-sm hover:bg-cta-hover transition-colors"
          >
            Add
          </button>
        </div>
        {error && <p className="text-xs text-err-text">{error}</p>}
        <ColorPicker selected={color} onSelect={setColor} />
      </div>

      {/* Existing classes */}
      {activeClasses.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-sm font-bold text-text-secondary">Your classes</h3>
          {activeClasses.map((cls) => (
            <div key={cls.id} className="bg-surface-raised border border-border rounded-xl p-4">
              {editingId === cls.id ? (
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      onKeyDown={(e) => { if (e.key === "Enter") saveEdit(); }}
                      className="flex-1 h-10 rounded-lg border border-border bg-surface text-text text-sm font-semibold outline-none px-3 focus:border-border-strong"
                    />
                  </div>
                  <ColorPicker selected={editColor} onSelect={setEditColor} />
                  <div className="flex gap-2">
                    <button
                      onClick={saveEdit}
                      className="px-3 py-2 rounded-lg border-none bg-ok text-surface font-bold cursor-pointer text-xs hover:bg-ok-dim transition-colors"
                    >
                      Save
                    </button>
                    <button
                      onClick={() => setEditingId(null)}
                      className="px-3 py-2 rounded-lg border border-border bg-transparent text-text-muted font-semibold cursor-pointer text-xs hover:text-text-secondary transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span
                      className="w-4 h-4 rounded-full flex-shrink-0"
                      style={{ backgroundColor: cls.color }}
                    />
                    <span className="font-semibold text-sm">{cls.name}</span>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => startEdit(cls)}
                      className="px-3 py-1.5 rounded-lg border border-border bg-transparent text-text-muted font-semibold cursor-pointer text-xs hover:text-text-secondary hover:border-border-strong transition-colors"
                    >
                      Edit
                    </button>
                    {confirmDelete === cls.id ? (
                      <div className="flex gap-1">
                        <button
                          onClick={() => handleDelete(cls.id)}
                          className="px-3 py-1.5 rounded-lg border-none bg-err text-white font-bold cursor-pointer text-xs"
                        >
                          Yes, delete
                        </button>
                        <button
                          onClick={() => setConfirmDelete(null)}
                          className="px-3 py-1.5 rounded-lg border border-border bg-transparent text-text-muted font-semibold cursor-pointer text-xs"
                        >
                          No
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setConfirmDelete(cls.id)}
                        className="px-3 py-1.5 rounded-lg border border-border bg-transparent text-err-text font-semibold cursor-pointer text-xs hover:bg-err-bg transition-colors"
                      >
                        Delete
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Semester archive */}
      {activeClasses.length > 0 && (
        <div className="border-t border-border pt-4">
          {confirmArchive ? (
            <div className="bg-surface-raised border border-border rounded-xl p-4 space-y-3">
              <p className="text-sm text-text-secondary">
                This will archive all current classes and their entries. You can start fresh with new classes for the new semester.
              </p>
              <div className="flex gap-2">
                <button
                  onClick={handleArchive}
                  className="px-4 py-2 rounded-lg border-none bg-err text-white font-bold cursor-pointer text-sm"
                >
                  Archive all
                </button>
                <button
                  onClick={() => setConfirmArchive(false)}
                  className="px-4 py-2 rounded-lg border border-border bg-transparent text-text-muted font-semibold cursor-pointer text-sm"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setConfirmArchive(true)}
              className="text-xs text-text-faint hover:text-text-muted transition-colors cursor-pointer bg-transparent border-none"
            >
              New semester? Archive all classes &rarr;
            </button>
          )}
        </div>
      )}

      {/* Empty state */}
      {activeClasses.length === 0 && archivedClasses.length === 0 && (
        <div className="text-center py-8">
          <p className="text-text-muted text-sm">Add your classes above to get started</p>
        </div>
      )}

      {activeClasses.length === 0 && archivedClasses.length > 0 && (
        <div className="text-center py-8">
          <p className="text-text-muted text-sm">All classes archived. Add new classes for this semester!</p>
        </div>
      )}
    </div>
  );
}
