import { useEffect, useState } from "react";
import SettingsCard from "../components/SettingsCard";
import type { BackupSettings } from "../../DatabaseDetails/types";
import StatusBar from "../../../components/StatusBar/StatusBar";

type PrimaryStorageCardProps = {
  settings: BackupSettings,
  onUpdate: (patch: Partial<BackupSettings>) => Promise<void>
} 

function PrimaryStorageCard({ settings, onUpdate }: PrimaryStorageCardProps) {
  const [editing, setEditing] = useState(false);

  const [storageTarget, setStorageTarget] = useState(settings.storageTarget);
  const [s3Bucket, setS3Bucket] = useState(settings.s3Bucket ?? "");
  const [s3Region, setS3Region] = useState(settings.s3Region ?? "");
  const [backupUploadRoleArn, setBackupUploadRoleArn] = useState(settings.backupUploadRoleArn ?? "")
  const [backupRestoreRoleArn, setBackupRestoreRoleArn] = useState(settings.backupRestoreRoleArn ?? "")
  const [backupDeleteRoleArn, setBackupDeleteRoleArn] = useState(settings.backupDeleteRoleArn ?? "")
  const [localPath, setLocalPath] = useState(settings.localStoragePath ?? "");

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

    if (storageTarget === "S3") {
      if (!s3Bucket.trim()) {
        return "S3 bucket is required";
      }
      if (!s3Region.trim()) {
        return "S3 region is required";
      }
      if (!backupUploadRoleArn.trim()) {
        return "IAM Backup Upload Role ARN is required";
      }

      const IAM_ROLE_ARN_REGEX = /^arn:aws:iam::\d{12}:role\/[A-Za-z0-9+=,.@_\-\/]+$/;

      if (!IAM_ROLE_ARN_REGEX.test(backupUploadRoleArn.trim())) {
        return "Invalid IAM Backup Upload ARN format";
      }

      //Restore ARN is optional
      if ( backupRestoreRoleArn.trim() && !IAM_ROLE_ARN_REGEX.test(backupRestoreRoleArn.trim())) {
        return "Invalid IAM Backup Restore ARN format";
      }

      if (settings.retentionEnabled === true) {
        if (!backupDeleteRoleArn || !backupDeleteRoleArn.trim()) {
          return "Backup Delete Role ARN is required when retention is enabled";
        }

        if (!IAM_ROLE_ARN_REGEX.test(backupDeleteRoleArn.trim())) {
          return "Invalid IAM Backup Delete ARN format";
        }
      }
    }

    if (storageTarget === "LOCAL") {
      if (!localPath.trim()) {
        return "Local storage path is required";
      }
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

    const patch: Partial<BackupSettings> = {};

    if (storageTarget !== settings.storageTarget) {
      patch.storageTarget = storageTarget;
    }

    if (storageTarget === "S3") {
      if (s3Bucket !== settings.s3Bucket) patch.s3Bucket = s3Bucket.trim();
      if (s3Region !== settings.s3Region) patch.s3Region = s3Region.trim();
      if (backupUploadRoleArn !== settings.backupUploadRoleArn) patch.backupUploadRoleArn = backupUploadRoleArn.trim();

      // Optional restore role
      if (backupRestoreRoleArn !== settings.backupRestoreRoleArn) patch.backupRestoreRoleArn = backupRestoreRoleArn.trim() || null;
      if (backupDeleteRoleArn !== settings.backupDeleteRoleArn) patch.backupDeleteRoleArn = backupDeleteRoleArn.trim() || null;

      patch.localStoragePath = null;
    }


    if (storageTarget === "LOCAL") {
      if (localPath !== settings.localStoragePath) {
        patch.localStoragePath = localPath.trim();
      }
      patch.s3Bucket = null;
      patch.s3Region = null;
      patch.backupUploadRoleArn = null;
      patch.backupRestoreRoleArn = null;
      patch.backupDeleteRoleArn = null;
    }
    

    if (Object.keys(patch).length === 0) {
      setEditing(false);
      return;
    }

    try {
      await onUpdate(patch);

      setStatusMessage({
        type: "success",
        message: "Default backup type updated successfully",
      });

      setEditing(false);
    } catch (err) {
      console.error(err);

      setStatusMessage({
        type: "error",
        message: "Failed to update Primary Storage Target. Please try again.",
      });
    }

  }


  return (
    <>
      <SettingsCard
        title="Primary Storage Target"
        editing={editing}
        onEdit={() => setEditing(true)}
        onCancel={() => {
          setStorageTarget(settings.storageTarget);
          setS3Bucket(settings.s3Bucket ?? "");
          setS3Region(settings.s3Region ?? "");
          setBackupUploadRoleArn(settings.backupUploadRoleArn ?? "")
          setBackupRestoreRoleArn(settings.backupRestoreRoleArn ?? "")
          setBackupDeleteRoleArn(settings.backupDeleteRoleArn ?? "")
          setLocalPath(settings.localStoragePath ?? "");
          setEditing(false);
          setStatusMessage(null);
        }}
        onSave = {handleSave}
      >
        <div>
          <label className="block text-sm mb-1">Storage type</label>
          <select
            disabled={!editing}
            value={storageTarget}
            onChange={(e) => {
              setStorageTarget(e.target.value as any);
              clearError()  
            }}
            className="w-full border rounded px-3 py-2 disabled:opacity-100"
          >
            <option value="S3">S3</option>
            <option value="LOCAL">Local filesystem</option>
          </select>
        </div>

        {storageTarget === "S3" && (
          <>
            <div>
              <label className="block text-sm mb-1">S3 bucket</label>
              <input
                disabled={!editing}
                value={s3Bucket}
                onChange={(e) => {
                  setS3Bucket(e.target.value);
                  clearError()  
                }}
                className="w-full border rounded px-3 py-2 disabled:opacity-100"
              />
            </div>

            <div>
              <label className="block text-sm mb-1">Region</label>
              <input
                disabled={!editing}
                value={s3Region}
                onChange={(e) => {
                  setS3Region(e.target.value);
                  clearError()  
                }}
                className="w-full border rounded px-3 py-2 disabled:opacity-100"
              />
            </div>

            <div>
              <label className="block text-sm mb-1">IAM Backup Upload Role ARN</label>
              <input
                disabled={!editing}
                value={backupUploadRoleArn}
                onChange={(e) => {
                  setBackupUploadRoleArn(e.target.value);
                  clearError()  
                }}
                className="w-full border rounded px-3 py-2 disabled:opacity-100"
              />
            </div>

            <div>
              <label className="block text-sm mb-1">IAM Backup Download/Restore Role ARN <span className="text-gray-400">(optional)</span> </label>
              <input
                disabled={!editing}
                value={backupRestoreRoleArn}
                onChange={(e) => {
                  setBackupRestoreRoleArn(e.target.value);
                  clearError()  
                }}
                className="w-full border rounded px-3 py-2 disabled:opacity-100"
              />
            </div>

            <div>
              <label className="block text-sm mb-1">IAM Backup Delete Role ARN <span className="text-gray-400">(optional)</span> </label>
              <input
                disabled={!editing}
                value={backupDeleteRoleArn}
                onChange={(e) => {
                  setBackupDeleteRoleArn(e.target.value);
                  clearError()  
                }}
                className="w-full border rounded px-3 py-2 disabled:opacity-100"
              />
            </div>
          </>
        )}

        {storageTarget === "LOCAL" && (
          <div>
            <label className="block text-sm mb-1">Storage path</label>
            <input
              disabled={!editing}
              value={localPath}
              onChange={(e) => {
                  setLocalPath(e.target.value);
                  clearError()  
              }}
              className="w-full border rounded px-3 py-2 disabled:opacity-100"
            />
          </div>

          
        )}

      
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

export default PrimaryStorageCard