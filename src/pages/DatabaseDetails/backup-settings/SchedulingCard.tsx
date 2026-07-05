import { useEffect, useState } from "react";
import SettingsCard from "../components/SettingsCard";
import type { BackupSettings } from "../../DatabaseDetails/types";
import StatusBar from "../../../components/StatusBar/StatusBar";
import { Info, X, Copy, Check } from "lucide-react";

    type SchedulingCardProps = {
      settings: BackupSettings,
      onUpdate: (patch: Partial<BackupSettings>) => Promise<void>
    } 

function SchedulingCard({ settings, onUpdate}: SchedulingCardProps ) {
  const [editing, setEditing] = useState(false);
  const [enabled, setEnabled] = useState(settings.schedulingEnabled);
  const [cron, setCron] = useState(settings.cronExpression ?? "");

  const [statusMessage, setStatusMessage] = useState<{ type: "success" | "error";  message: string;} | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [copiedExample, setCopiedExample] = useState<string | null>(null);

  const cronExamples = [
    { label: "Every hour (at minute 0)", expr: "0 * * * *" },
    { label: "Daily at midnight UTC", expr: "0 0 * * *" },
    { label: "Daily at 2:00 AM UTC", expr: "0 2 * * *" },
    { label: "Every Sunday at midnight UTC", expr: "0 0 * * 0" },
    { label: "Every weekday (Mon-Fri) at midnight UTC", expr: "0 0 * * 1-5" },
    { label: "Every 12 hours (noon and midnight)", expr: "0 0,12 * * *" },
  ];

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedExample(text);
    setTimeout(() => setCopiedExample(null), 2000);
  };

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
            <label className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
              <input
                type="checkbox"
                disabled={!editing || isLocalStorage}
                checked={enabled}
                onChange={(e) => {
                  setEnabled(e.target.checked);
                  if (!e.target.checked) {
                    setCron("");
                  }
                  clearError();
                }}
              />
              Enable scheduled backups
            </label>

            <div>
              <div className="flex items-center gap-2 mb-1">
                <label className="block text-sm text-gray-700 dark:text-gray-300">Cron expression <span className="font-bold">(UTC)</span></label>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(true)}
                  className="text-blue-500 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 transition-colors p-0.5 rounded-full hover:bg-gray-100 dark:hover:bg-neutral-800 cursor-pointer flex items-center justify-center"
                  title="How CRON expressions work"
                >
                  <Info className="h-3.5 w-3.5" />
                </button>
              </div>
              <input
                type="text"
                disabled={!editing || !enabled || isLocalStorage}
                value={cron}
                onChange={(e) => {
                  setCron(e.target.value);
                  clearError();
                }}
                className={`w-full border border-gray-200 dark:border-neutral-700 rounded px-3 py-2 bg-white dark:bg-neutral-950 text-gray-900 dark:text-gray-100 ${
                  editing && enabled && !isLocalStorage ? "opacity-100" : "opacity-60 cursor-not-allowed"
                }`}
              />
              <p className="text-xs mt-1 text-gray-500 dark:text-gray-400">
                Example: 0 2 * * * 
              </p>
            </div>

            {isLocalStorage && (
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
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

          {isModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs transition-opacity duration-300 animate-in fade-in">
              <div className="bg-white dark:bg-neutral-900 rounded-xl shadow-2xl border border-gray-200 dark:border-neutral-800 w-full max-w-md max-h-[90vh] overflow-y-auto flex flex-col transform scale-100 transition-all duration-300 animate-in zoom-in-95">
                {/* Modal Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-neutral-850 sticky top-0 bg-white dark:bg-neutral-900 z-10">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                    <Info className="h-5 w-5 text-blue-500" />
                    Cron Expressions Guide
                  </h3>
                  <button
                    onClick={() => setIsModalOpen(false)}
                    className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                {/* Modal Content */}
                <div className="p-6 space-y-6 text-sm text-gray-650 dark:text-gray-300 leading-relaxed overflow-y-auto">
                  <p>
                    A CRON expression is a string composed of 5 fields separated by spaces. It determines the schedule for your automated backups.
                  </p>

                  {/* Diagram */}
                  <div className="space-y-2">
                    <h4 className="font-semibold text-gray-800 dark:text-gray-100 text-xs uppercase tracking-wider">Format</h4>
                    <div className="bg-gray-50 dark:bg-neutral-950 p-4 rounded-lg border border-gray-205 dark:border-neutral-850 font-mono text-xs text-gray-800 dark:text-gray-200 space-y-2">
                      <div className="font-bold text-blue-600 dark:text-blue-400 tracking-widest text-center border-b border-gray-200 dark:border-neutral-800 pb-2">minute hour dom month dow</div>
                      <div className="text-[11px] text-gray-400 dark:text-gray-500 flex flex-col space-y-1 mt-1 pl-1">
                        <div><span className="font-bold text-gray-700 dark:text-gray-300 font-mono">minute:</span> Minute (0 - 59)</div>
                        <div><span className="font-bold text-gray-700 dark:text-gray-300 font-mono">hour:</span> Hour (0 - 23)</div>
                        <div><span className="font-bold text-gray-700 dark:text-gray-300 font-mono">dom:</span> Day of Month (1 - 31)</div>
                        <div><span className="font-bold text-gray-700 dark:text-gray-300 font-mono">month:</span> Month (1 - 12)</div>
                        <div><span className="font-bold text-gray-700 dark:text-gray-300 font-mono">dow:</span> Day of Week (0 - 6, Sunday = 0)</div>
                      </div>
                    </div>
                  </div>

                  {/* Special Characters */}
                  <div className="space-y-2">
                    <h4 className="font-semibold text-gray-800 dark:text-gray-100 text-xs uppercase tracking-wider">Wildcards & Operators</h4>
                    <ul className="list-disc pl-5 space-y-1.5 text-xs text-gray-650 dark:text-gray-400">
                      <li><code>*</code> (asterisk): matches any value in the field.</li>
                      <li><code>,</code> (comma): separates items in a list (e.g. <code>1,3,5</code>).</li>
                      <li><code>-</code> (hyphen): defines ranges (e.g. <code>1-5</code>).</li>
                      <li><code>/</code> (slash): specifies increments/steps (e.g. <code>*/15</code> in minutes means every 15 minutes).</li>
                    </ul>
                  </div>

                  {/* Common Examples */}
                  <div className="space-y-2">
                    <h4 className="font-semibold text-gray-800 dark:text-gray-100 text-xs uppercase tracking-wider">Common Examples</h4>
                    <div className="space-y-2">
                      {cronExamples.map((ex) => (
                        <div key={ex.expr} className="flex items-center justify-between p-2.5 bg-gray-50 dark:bg-neutral-950 rounded border border-gray-150 dark:border-neutral-800 text-xs">
                          <div>
                            <div className="text-gray-500 dark:text-gray-400 text-[11px]">{ex.label}</div>
                            <div className="font-mono font-bold text-gray-800 dark:text-gray-200 mt-0.5">{ex.expr}</div>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleCopy(ex.expr)}
                            className="bg-white dark:bg-neutral-900 hover:bg-gray-50 dark:hover:bg-neutral-800 border border-gray-200 dark:border-neutral-700 text-gray-650 dark:text-gray-300 px-2.5 py-1.5 rounded transition-colors flex items-center gap-1 shadow-2xs text-[11px] cursor-pointer font-medium"
                          >
                            {copiedExample === ex.expr ? (
                              <>
                                <Check className="h-3 w-3 text-green-500" />
                                <span>Copied</span>
                              </>
                            ) : (
                              <>
                                <Copy className="h-3 w-3" />
                                <span>Copy</span>
                              </>
                            )}
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Modal Footer */}
                <div className="px-6 py-4 border-t border-gray-100 dark:border-neutral-800 flex justify-end bg-gray-50 dark:bg-neutral-900/50 rounded-b-xl sticky bottom-0 z-10">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-neutral-900 hover:bg-gray-50 dark:hover:bg-neutral-800 border border-gray-300 dark:border-neutral-700 rounded-lg transition-colors cursor-pointer"
                  >
                    Close Guide
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      );
    }

    export default SchedulingCard;