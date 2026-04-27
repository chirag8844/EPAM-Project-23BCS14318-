import { useState } from "react";

const PALETTE = [
  "#6366F1",
  "#8B5CF6",
  "#06B6D4",
  "#F97316",
  "#10B981",
  "#EF4444",
  "#F59E0B",
  "#EC4899",
  "#60A5FA",
  "#7C3AED",
];

function hashStringToNumber(str) {
  let hash = 5381;
  for (let i = 0; i < str.length; i++) {
    hash = (hash * 33) ^ str.charCodeAt(i);
  }
  return Math.abs(hash >>> 0);
}

function pickColor(name) {
  if (!name) return PALETTE[Math.floor(Math.random() * PALETTE.length)];
  const idx = hashStringToNumber(name) % PALETTE.length;
  return PALETTE[idx];
}

function getContrastColor(hex) {
  if (!hex) return "#ffffff";
  const h = hex.replace("#", "");
  const r = parseInt(h.substring(0, 2), 16);
  const g = parseInt(h.substring(2, 4), 16);
  const b = parseInt(h.substring(4, 6), 16);
  const luminance = 0.299 * r + 0.587 * g + 0.114 * b;
  return luminance > 186 ? "#111827" : "#ffffff";
}

function UserAvatar({ name = "", imageUrl = "", size = 32, onClick, className = "" }) {
  const [imgError, setImgError] = useState(false);
  const initial = name && name.length > 0 ? name.charAt(0).toUpperCase() : "?";
  const hasImage = imageUrl && !imgError;
  const bgColor = hasImage ? undefined : pickColor(name || "user");
  const textColor = hasImage ? undefined : getContrastColor(bgColor);

  return (
    <button
      type="button"
      onClick={onClick}
      title={name || "User"}
      className={`w-8 h-8 rounded-full overflow-hidden flex items-center justify-center font-medium text-sm ring-1 ring-white/30 shadow-sm hover:scale-105 transition-transform ${className}`}
      style={{ width: size, height: size, backgroundColor: bgColor, color: textColor }}
    >
      {hasImage ? (
        <img
          src={imageUrl}
          alt={name}
          className="w-full h-full object-cover"
          onError={() => setImgError(true)}
          loading="lazy"
        />
      ) : (
        <span className="select-none">{initial}</span>
      )}
    </button>
  );
}

export default UserAvatar;
