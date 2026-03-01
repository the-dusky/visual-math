"use client";
import { CLASS_COLORS } from "../constants";

export function ColorPicker({ selected, onSelect }) {
  return (
    <div className="flex gap-2 flex-wrap">
      {CLASS_COLORS.map((color) => (
        <button
          key={color}
          onClick={() => onSelect(color)}
          className="w-8 h-8 rounded-full border-2 cursor-pointer transition-transform hover:scale-110"
          style={{
            backgroundColor: color,
            borderColor: selected === color ? "#fafafa" : "transparent",
            transform: selected === color ? "scale(1.15)" : undefined,
          }}
          aria-label={`Select color ${color}`}
        />
      ))}
    </div>
  );
}
