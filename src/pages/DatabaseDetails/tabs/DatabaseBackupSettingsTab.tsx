import { useEffect, useState } from "react";
import type { BackupSettings } from "../../DatabaseDetails/types";
import { getBackupSettings, updateBackupSettings } from "../../../services/backup-settings.service";
import { useParams } from "react-router-dom";
import RetentionPolicyCard from "../backup-settings/RetentionPolicyCard";
import SchedulingCard from "../backup-settings/SchedulingCard";
import LimitsCard from "../backup-settings/LimitsCard";
import DefaultBackupTypeCard from "../backup-settings/DefaultBackupTypeCard";
import PrimaryStorageCard from "../backup-settings/PrimaryStorageCard";
import ErrorState from "../../Databases/components/ErrorState";


export default function DatabaseBackupSettingsTab() {
  const [settings, setSettings] = useState<BackupSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string |null>(null)
  const [saving, setSaving] = useState(false);

  const { id } = useParams<{ id: string }>();

  const fetchSettings = async () => {
    if (!id) {
      throw new Error("Database ID is missing in URL parameters.");
    }
    const data = await getBackupSettings(id);
    setSettings(data);
  };


  //update settings
  async function handleUpdateBackupSettings( patch: Partial<BackupSettings> ): Promise<void> {
    if(saving){
      return
    }

    if (!id) {
      console.error("Missing database ID");
      return;
    }

    //Do not send empty PATCH
    if (Object.keys(patch).length === 0) {
      return;
    }

    const prev = settings;
    setSaving(true)

    try {
      await updateBackupSettings(id, patch);

      // Sync current state
      await fetchSettings();

    } catch (error) {
      setSettings(prev);
      console.error("Failed to update backup settings:", error);
      throw error; 
    } finally {
      setSaving(false)
    }
  }

  //fetch settings
  useEffect(() => {
    const load = async() => {
      try {
        await fetchSettings()
      } catch(error){
        setError("Error fetching backup settings")
        console.log("Error fetching backup settings: ", error)
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [id]);

  if (error && !loading) {
    return (
      <ErrorState errorMessage={error} />
    );
  }

  return (
    <div className="space-y-6 me-2 mb-4 pb-24 md:pb-0 text-sm md:text-base">
      {loading ? (
        <>
          <div className="min-h-80.25 rounded-xl border bg-gray-200 animate-pulse" />
          <div className="min-h-78.5 rounded-xl border bg-gray-200 animate-pulse" />
          <div className="min-h-55.5 rounded-xl border bg-gray-100 animate-pulse" />
          <div className="min-h-53 rounded-xl border bg-gray-100 animate-pulse" />
          <div className="min-h-38 rounded-xl border bg-gray-100 animate-pulse" />
        </>
      ) : (
        settings && (
          <>
            <PrimaryStorageCard settings={settings} onUpdate={handleUpdateBackupSettings} />
            <RetentionPolicyCard settings={settings} onUpdate={handleUpdateBackupSettings} />
            <DefaultBackupTypeCard settings={settings} onUpdate={handleUpdateBackupSettings} />
            <SchedulingCard settings={settings} onUpdate={handleUpdateBackupSettings} />
            <LimitsCard settings={settings} onUpdate={handleUpdateBackupSettings} />
          </>
        )
      )}
    </div>
  );
}
