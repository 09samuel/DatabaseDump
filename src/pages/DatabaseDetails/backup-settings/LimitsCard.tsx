import { useEffect, useState } from "react";
import SettingsCard from "../components/SettingsCard";
import type { BackupSettings } from "../../DatabaseDetails/types";
import StatusBar from "../../../components/StatusBar/StatusBar";

type LimitsCardProps = {
  settings: BackupSettings,
  onUpdate: (patch: Partial<BackupSettings>) => Promise<void>
} 


function LimitsCard({ settings, onUpdate }: LimitsCardProps) {
  const [editing, setEditing] = useState(false);
  const [time, setTime] = useState<string>(String(settings.timeoutMinutes ?? 60))

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


  const validate = (): string | null => {
    const parsed = Number(time);

    if (!Number.isInteger(parsed)) {
      return "Timeout must be a valid number";
    } else if (parsed <= 0) {
      return "Timeout must be greater than 0 minutes";
    } else if (parsed > 1440) {
      return "Timeout cannot exceed 1440 minutes (24 hours)";
    }

    return null;
  };


  async function handleSave() {
    const error = validate();

    if (error) {
      setStatusMessage({
        type: "error",
        message: error,
      });
      return;
    }

    const parsed = Number(time);

    if (parsed === settings.timeoutMinutes) {
      setEditing(false);
      return;
    }

    try {
      await onUpdate({ timeoutMinutes: parsed });

      setStatusMessage({
        type: "success",
        message: "Backup timeout updated successfully",
      });

      setEditing(false);
    } catch (err) {
      console.error(err);

      setStatusMessage({
        type: "error",
        message: "Failed to update backup timeout. Please try again.",
      });
    }
  }



  return (
    <>
      <SettingsCard
        title="Timeout & Limits"
        editing={editing}
        onEdit={() => setEditing(true)}
        onCancel={() => {
          setTime(String(settings.timeoutMinutes ?? 60));
          setEditing(false);
          setStatusMessage(null)
        }}
        onSave={handleSave}
      >
        <label className="block text-sm mb-1">
          Backup timeout (minutes)
        </label>
        <input
          type="number"
          disabled={!editing}
          value={time}
          onChange={(e) => {
            setTime(e.target.value); 
            clearError()
          }}
          className="w-full border rounded px-3 py-2 disabled:opacity-100"
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

export default LimitsCard