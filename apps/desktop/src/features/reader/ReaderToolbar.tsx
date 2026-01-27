import type { ReaderSettings } from "./readerSettings";

type Props = {
  settings: ReaderSettings;
  setSettings: (next: ReaderSettings) => void;
  onBackToInput: () => void;
};

export function ReaderToolbar({ settings, setSettings, onBackToInput }: Props) {
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
        borderBottom: "1px solid rgba(0,0,0,0.12)",
        background: settings.theme === "dark" ? "#0f1115" : "#ffffff",
      }}
    >
      <button onClick={onBackToInput}>Back</button>

      <label style={{ display: "flex", gap: 6, alignItems: "center" }}>
        Font
        <input
          type="range"
          min={14}
          max={28}
          value={settings.fontSize}
          onChange={(e) => setSettings({ ...settings, fontSize: Number(e.target.value) })}
        />
        <span style={{ width: 34, textAlign: "right" }}>{settings.fontSize}px</span>
      </label>

      <label style={{ display: "flex", gap: 6, alignItems: "center" }}>
        Width
        <input
          type="range"
          min={520}
          max={980}
          step={20}
          value={settings.maxWidth}
          onChange={(e) => setSettings({ ...settings, maxWidth: Number(e.target.value) })}
        />
        <span style={{ width: 44, textAlign: "right" }}>{settings.maxWidth}</span>
      </label>

      <label style={{ display: "flex", gap: 6, alignItems: "center" }}>
        Line
        <input
          type="range"
          min={1.2}
          max={2.2}
          step={0.05}
          value={settings.lineHeight}
          onChange={(e) => setSettings({ ...settings, lineHeight: Number(e.target.value) })}
        />
        <span style={{ width: 34, textAlign: "right" }}>{settings.lineHeight.toFixed(2)}</span>
      </label>

      <div style={{ marginLeft: "auto", display: "flex", gap: 8, alignItems: "center" }}>
        <button
          onClick={() =>
            setSettings({ ...settings, theme: settings.theme === "dark" ? "light" : "dark" })
          }
        >
          {settings.theme === "dark" ? "Light" : "Dark"}
        </button>
      </div>
    </div>
  );
}