import { useEffect, useState } from "react";
import SettingsCard from "../components/SettingsCard";
import type { BackupSettings } from "../../DatabaseDetails/types";
import StatusBar from "../../../components/StatusBar/StatusBar";

type RetentionPolicyCardProps = {
  settings: BackupSettings,
  onUpdate: (patch: Partial<BackupSettings>) => Promise<void>
} 

function RetentionPolicyCard({ settings, onUpdate }: RetentionPolicyCardProps) {
  const [editing, setEditing] = useState(false);

  const [enabled, setEnabled] = useState(settings.retentionEnabled);
  const [mode, setMode] = useState(settings.retentionMode ?? "COUNT");
  const [value, setValue] = useState<number>(settings.retentionValue ?? 1);

  const [statusMessage, setStatusMessage] = useState<{ type: "success" | "error";  message: string;} | null>(null);
  
  //To auto-clear status message
  useEffect(() => {
    if (!statusMessage) return;
  
    const t = setTimeout(() => setStatusMessage(null), 3000);
    return () => clearTimeout(t);
  }, [statusMessage]);
  

  //clear error on input change
  const clearError = () => {
    if (statusMessage?.type === "error") {
      setStatusMessage(null);
    }
  };

  
  //Disable number inputs when NONE is selcted
  // useEffect(() => {
  //   if (mode === "NONE") return;
  //   if (value <= 0) {
  //     setValue(1);
  //   }
  // }, [mode]);


  const validate = (): string | null => {
    if (!enabled) return null;

    if (!value || value <= 0) {
      return mode === "COUNT"
        ? "Number of backups must be greater than 0"
        : "Retention days must be greater than 0";
    }

    return null;
  };



  async function handleSave() {
    const error = validate();
    if (error) {
      setStatusMessage({ type: "error", message: error });
      return;
    }

    const patch: Partial<BackupSettings> = {};

    if (enabled !== settings.retentionEnabled) {
      patch.retentionEnabled = enabled;
    }

    if (!enabled) {
      // Explicitly disable retention
      patch.retentionMode = null;
      patch.retentionValue = null;
    } else {
      if (mode !== settings.retentionMode) {
        patch.retentionMode = mode;
      }
      if (value !== settings.retentionValue) {
        patch.retentionValue = value;
      }
    }

    if (Object.keys(patch).length === 0) {
      setEditing(false);
      return;
    }

    try {
      await onUpdate(patch);
      setStatusMessage({
        type: "success",
        message: "Retention policy updated successfully",
      });
      setEditing(false);
    } catch {
      setStatusMessage({
        type: "error",
        message: "Failed to update retention policy",
      });
    }
  }


  return (
    <>
      <SettingsCard
        title="Retention Policy"
        editing={editing}
        onEdit={() => setEditing(true)}
        onCancel={() => {
          setEnabled(settings.retentionEnabled);
          setMode(settings.retentionMode ?? "COUNT");
          setValue(settings.retentionValue ?? 1);
          setEditing(false);
          setStatusMessage(null);
        }}
        onSave = {handleSave}
      >
        <label className="flex items-center gap-2 mb-4">
          <input
            type="checkbox"
            disabled={!editing}
            checked={enabled}
            onChange={(e) => {
              setEnabled(e.target.checked);
              clearError();
            }}
          />
          Enable retention policy
        </label>

        <label className="flex items-center gap-2">
          <input
            type="radio"
            disabled={!editing || !enabled}
            checked={mode === "COUNT"}
            onChange={() => {
              setMode("COUNT");
              clearError()
            }}
          />
          Keep last N backups
        </label>


        <input
          type="number"
          disabled={!editing || !enabled || mode !== "COUNT"}
          value={enabled && mode === "COUNT" ? value : ""}
          onChange={(e) => {
            setValue(Number(e.target.value));
            clearError()
          }}
          className="w-full border rounded px-3 py-2 disabled:opacity-60"
        />

        <label className="flex items-center gap-2 mt-4">
          <input
            type="radio"
            disabled={!editing || !enabled}
            checked={mode === "DAYS"}
            onChange={() => {
              setMode("DAYS");
              clearError()
            }}
          />
          Retain for days
        </label>

        <input
          type="number"
          disabled={!editing || !enabled || mode !== "DAYS"}
          value={enabled && mode === "DAYS" ? value : ""}
          onChange={(e) => {
            setValue(Number(e.target.value))
            clearError()
          }}
          
          className="w-full border rounded px-3 py-2 disabled:opacity-60"
        />

      </SettingsCard>

      {statusMessage && (
        <StatusBar
          type={statusMessage.type}
          message={statusMessage.message}
          onClose={() => setStatusMessage(null)}
        />
      )}
    </>
  );
}

export default RetentionPolicyCard