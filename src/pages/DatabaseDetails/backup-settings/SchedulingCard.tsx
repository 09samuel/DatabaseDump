import { useEffect, useState } from "react";
  import SettingsCard from "../components/SettingsCard";
  import type { BackupSettings } from "../../DatabaseDetails/types";
  import StatusBar from "../../../components/StatusBar/StatusBar";

  type SchedulingCardProps = {
    settings: BackupSettings,
    onUpdate: (patch: Partial<BackupSettings>) => Promise<void>
  } 

  function SchedulingCard({ settings, onUpdate}: SchedulingCardProps ) {
    const [editing, setEditing] = useState(false);
    const [enabled, setEnabled] = useState(settings.schedulingEnabled);
    const [cron, setCron] = useState(settings.cronExpression ?? "");

    const [statusMessage, setStatusMessage] = useState<{ type: "success" | "error";  message: string;} | null>(null);

    const isLocalStorage = settings.storageTarget === "LOCAL";

    
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

    //Clear cron when disabling scheduling
    useEffect(() => {
      if (!enabled) {
        setCron("");
      }
    }, [enabled]);

        
    const validate = (): string | null => {

      if (enabled) {
        if (!cron.trim()) {
          return "Cron expression is required when scheduling is enabled";
        }

        //basic cron format check (5 fields)
        else if (cron.trim().split(/\s+/).length !== 5) {
          return "Cron expression must have 5 fields";
        }
      }

      return null;
    };



    async function handleSave() {
      if (isLocalStorage) {
        return;
      }

      const error = validate();

      if (error) {
        setStatusMessage({
          type: "error",
          message: error
        });

        return;
      }

      const patch: Partial<BackupSettings> = {
        schedulingEnabled: enabled,
        cronExpression: enabled ? cron : null,
      };

      try {
      await onUpdate(patch);

      setStatusMessage({
        type: "success",
        message: "Storage settings updated successfully",
      });

      setEditing(false);
    } catch (err) {
      console.error(err);

      setStatusMessage({
        type: "error",
        message: "Failed to update Scheduling. Please try again.",
      });
    }
    }



    return (
      <div className={isLocalStorage ? "cursor-not-allowed" : ""}>
        <SettingsCard   
          title="Scheduling"
          editing={editing}
          disableEdit={isLocalStorage}
          onEdit={() => setEditing(true)}
          onCancel={() => {
            setEnabled(settings.schedulingEnabled);
            setCron(settings.cronExpression ?? "");
            setEditing(false);
            setStatusMessage(null)
          }}
          onSave={handleSave}
        >
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              disabled={!editing || isLocalStorage}
              checked={enabled}
              onChange={(e) => {
                setEnabled(e.target.checked);
                clearError()
              }}
            />
            Enable scheduled backups
          </label>

          <div>
            <label className="block text-sm mb-1">Cron expression</label>
            <input
              type="text"
              disabled={!editing || !enabled || !isLocalStorage}
              value={cron}
              onChange={(e) => {
                setCron(e.target.value);
                clearError();
              }}
              className={`w-full border rounded px-3 py-2 ${
                editing && enabled ? "opacity-100" : "opacity-60 cursor-not-allowed"
              }`}
            />
            <p className="text-xs mt-1 text-gray-500">
              Example: 0 2 * * *
            </p>
          </div>

          {isLocalStorage && (
            <p className="text-sm text-gray-500 mt-2">
              Scheduled backups are not available when using local storage.
            </p>
          )}
        </SettingsCard>

        {statusMessage && (
            <StatusBar
              type={statusMessage.type}
              message={statusMessage.message}
              onClose={() => setStatusMessage(null)}
            />
          )}

        

      </div>
    );
  }

  export default SchedulingCard