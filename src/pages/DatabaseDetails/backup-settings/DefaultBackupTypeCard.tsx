import { useEffect, useState } from "react";
import SettingsCard from "../components/SettingsCard";
import { type BackupSettings } from "../../DatabaseDetails/types";
import { type BackupType } from "../../Databases/types";

import StatusBar from "../../../components/StatusBar/StatusBar";

type DefaultBackupTypeCardProps = {
  settings: BackupSettings,
  onUpdate: (patch: Partial<BackupSettings>) => Promise<void>
} 

function DefaultBackupTypeCard({settings, onUpdate}: DefaultBackupTypeCardProps) {
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState<BackupType>(settings.defaultBackupType);

  const [statusMessage, setStatusMessage] = useState<{ type: "success" | "error";  message: string;} | null>(null);

  const isMongoDB = settings.engine.toLowerCase() === "mongodb";

  const allowedBackupTypes: BackupType[] = isMongoDB
    ? ["FULL", "DATA_ONLY"]
    : ["FULL", "STRUCTURE_ONLY", "DATA_ONLY"];

      
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
    if (!allowedBackupTypes.includes(value)) {
      return "Please select a valid default backup type";
    }
    return null;
  };


  async function handleSave() {
      const error = validate();

      if (error){
        setStatusMessage({
          type: "error",
          message: error, 
        });

        return;
      }
     
    

    if (value === settings.defaultBackupType) {
      setEditing(false);
      return;
    }

    try {
      await onUpdate({ defaultBackupType: value });

      setStatusMessage({
        type: "success",
        message: "Storage settings updated successfully",
      });

      setEditing(false);
    } catch (err) {
      console.error(err);

      setStatusMessage({
        type: "error",
        message: "Failed to update Default Backup Type. Please try again.",
      });
    }
  }


  return (
    <>
      <SettingsCard
        title="Default Backup Type"
        editing={editing}
        onEdit={() => setEditing(true)}
        onCancel={() => {
          setValue(settings.defaultBackupType);
          setEditing(false);
          setStatusMessage(null)
        }}
        onSave={handleSave}
      >
        <label className="flex items-center gap-2">
          <input
            type="radio"
            name="defaultBackupType"
            disabled={!editing}
            checked={value === "FULL"}
            onChange={() => {
              setValue("FULL");
              clearError();
            }}
          />
          Schema + Data
        </label>

        {!isMongoDB && (
          <label className="flex items-center gap-2">
            <input
              type="radio"
              name="defaultBackupType"
              disabled={!editing}
              checked={value === "STRUCTURE_ONLY"}
              onChange={() => {
                setValue("STRUCTURE_ONLY");
                clearError();
              }}
            />
            Schema only
          </label>
        )}

        {allowedBackupTypes.includes("DATA_ONLY") && (
          <label className="flex items-center gap-2">
            <input
              type="radio"
              name="defaultBackupType"
              disabled={!editing}
              checked={value === "DATA_ONLY"}
              onChange={() => {
                setValue("DATA_ONLY");
                clearError();
              }}
            />
            Data only
          </label>
        )}

        <p className="text-xs text-gray-500 mt-2">
          This backup type is used for scheduled backups and when no type is
          explicitly selected.
        </p>
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

export default DefaultBackupTypeCard