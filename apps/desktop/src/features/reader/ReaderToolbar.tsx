import type { ReaderSettings } from "./readerSettings";

type Props = {
  settings: ReaderSettings;
  setSettings: (next: ReaderSettings) => void;
  onBackToInput: () => void;
  onSave?: () => void;
};

export function ReaderToolbar({
  settings,
  setSettings,
  onBackToInput,
  onSave,
}: Props) {
  const isDark = settings.theme === "dark";

  return (
    <div
      style={{
        position: "sticky",
        top: 0,
        zIndex: 10,
        display: "flex",
        gap: 10,
        alignItems: "center",
        padding: "10px 12px",
        borderBottom: isDark
          ? "1px solid rgba(255,255,255,0.08)"
          : "1px solid rgba(0,0,0,0.12)",
        background: isDark ? "#0f1115" : "#ffffff",
      }}
    >
      {/* Back */}
      <button onClick={onBackToInput}>Back</button>

      {/* Save (optional) */}
      {onSave && <button onClick={onSave}>Save</button>}

      {/* Font size */}
      <label style={{ display: "flex", gap: 6, alignItems: "center" }}>
        Font
        <input
          type="range"
          min={14}
          max={28}
          value={settings.fontSize}
          onChange={(e) =>
            setSettings({
              ...settings,
              fontSize: Number(e.target.value),
            })
          }
        />
        <span style={{ width: 34, textAlign: "right" }}>
          {settings.fontSize}px
        </span>
      </label>

      {/* Content width */}
      <label style={{ display: "flex", gap: 6, alignItems: "center" }}>
        Width
        <input
          type="range"
          min={520}
          max={980}
          step={20}
          value={settings.maxWidth}
          onChange={(e) =>
            setSettings({
              ...settings,
              maxWidth: Number(e.target.value),
            })
          }
        />
        <span style={{ width: 44, textAlign: "right" }}>
          {settings.maxWidth}
        </span>
      </label>

      {/* Line height */}
      <label style={{ display: "flex", gap: 6, alignItems: "center" }}>
        Line
        <input
          type="range"
          min={1.2}
          max={2.2}
          step={0.05}
          value={settings.lineHeight}
          onChange={(e) =>
            setSettings({
              ...settings,
              lineHeight: Number(e.target.value),
            })
          }
        />
        <span style={{ width: 34, textAlign: "right" }}>
          {settings.lineHeight.toFixed(2)}
        </span>
      </label>

      {/* Spacer */}
      <div style={{ marginLeft: "auto" }} />

      {/* Theme toggle */}
      <button
        onClick={() =>
          setSettings({
            ...settings,
            theme: isDark ? "light" : "dark",
          })
        }
      >
        {isDark ? "Light" : "Dark"}
      </button>
    </div>
  );
}