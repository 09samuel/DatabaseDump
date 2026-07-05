import { useEffect, useState } from "react";
import SettingsCard from "../components/SettingsCard";
import type { BackupSettings } from "../../DatabaseDetails/types";
import StatusBar from "../../../components/StatusBar/StatusBar";
import { Info, X, Copy, Check } from "lucide-react";

type PrimaryStorageCardProps = {
  settings: BackupSettings,
  onUpdate: (patch: Partial<BackupSettings>) => Promise<void>
} 

function PrimaryStorageCard({ settings, onUpdate }: PrimaryStorageCardProps) {
  const [editing, setEditing] = useState(false);

  const [storageTarget, setStorageTarget] = useState(settings.storageTarget);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [copiedText, setCopiedText] = useState<string | null>(null);

  const trustJson = `{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": {
        "AWS": "arn:aws:iam::165772574272:user/DatabaseDumpIAM"
      },
      "Action": "sts:AssumeRole",
      "Condition": {
        "StringEquals": {
          "sts:ExternalId": "database-dump"
        }
      }
    }
  ]
}`;

  const policyJson = `{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "s3:PutObject",
        "s3:GetObject",
        "s3:DeleteObject"
      ],
      "Resource": "arn:aws:s3:::YOUR_BUCKET_NAME/*"
    }
  ]
}`;

  const handleCopy = (text: string, type: 'trust' | 'policy') => {
    navigator.clipboard.writeText(text);
    setCopiedText(type);
    setTimeout(() => setCopiedText(null), 2000);
  };
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
        title={
          <div className="flex items-center gap-2">
            <span>Primary Storage Target</span>
            <button
              type="button"
              onClick={() => setIsModalOpen(true)}
              className="text-blue-500 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 transition-colors p-1 rounded-full hover:bg-gray-100 dark:hover:bg-neutral-800 cursor-pointer flex items-center justify-center"
              title="How to configure AWS S3"
            >
              <Info className="h-4 w-4" />
            </button>
          </div>
        }
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
          <label className="block text-sm mb-1 text-gray-700 dark:text-gray-300">Storage type</label>
          <select
            disabled={!editing}
            value={storageTarget}
            onChange={(e) => {
              setStorageTarget(e.target.value as any);
              clearError()  
            }}
            className="w-full border border-gray-200 dark:border-neutral-700 rounded px-3 py-2 bg-white dark:bg-neutral-950 text-gray-900 dark:text-gray-100 disabled:opacity-100"
          >
            <option value="S3">S3</option>
            <option value="LOCAL">Local filesystem</option>
          </select>
        </div>

        {storageTarget === "S3" && (
          <>
            <div>
              <label className="block text-sm mb-1 text-gray-700 dark:text-gray-300">S3 bucket</label>
              <input
                disabled={!editing}
                value={s3Bucket}
                onChange={(e) => {
                  setS3Bucket(e.target.value);
                  clearError()  
                }}
                className="w-full border border-gray-200 dark:border-neutral-700 rounded px-3 py-2 bg-white dark:bg-neutral-950 text-gray-900 dark:text-gray-100 disabled:opacity-100"
              />
            </div>

            <div>
              <label className="block text-sm mb-1 text-gray-700 dark:text-gray-300">Region</label>
              <input
                disabled={!editing}
                value={s3Region}
                onChange={(e) => {
                  setS3Region(e.target.value);
                  clearError()  
                }}
                className="w-full border border-gray-200 dark:border-neutral-700 rounded px-3 py-2 bg-white dark:bg-neutral-950 text-gray-900 dark:text-gray-100 disabled:opacity-100"
              />
            </div>

            <div>
              <label className="block text-sm mb-1 text-gray-700 dark:text-gray-300">IAM Backup Upload Role ARN</label>
              <input
                disabled={!editing}
                value={backupUploadRoleArn}
                onChange={(e) => {
                  setBackupUploadRoleArn(e.target.value);
                  clearError()  
                }}
                className="w-full border border-gray-200 dark:border-neutral-700 rounded px-3 py-2 bg-white dark:bg-neutral-950 text-gray-900 dark:text-gray-100 disabled:opacity-100"
              />
            </div>

            <div>
              <label className="block text-sm mb-1 text-gray-700 dark:text-gray-300">IAM Backup Download/Restore Role ARN <span className="text-gray-400 dark:text-gray-500">(optional)</span> </label>
              <input
                disabled={!editing}
                value={backupRestoreRoleArn}
                onChange={(e) => {
                  setBackupRestoreRoleArn(e.target.value);
                  clearError()  
                }}
                className="w-full border border-gray-200 dark:border-neutral-700 rounded px-3 py-2 bg-white dark:bg-neutral-950 text-gray-900 dark:text-gray-100 disabled:opacity-100"
              />
            </div>

            <div>
              <label className="block text-sm mb-1 text-gray-700 dark:text-gray-300">IAM Backup Delete Role ARN <span className="text-gray-400 dark:text-gray-500">(optional)</span> </label>
              <input
                disabled={!editing}
                value={backupDeleteRoleArn}
                onChange={(e) => {
                  setBackupDeleteRoleArn(e.target.value);
                  clearError()  
                }}
                className="w-full border border-gray-200 dark:border-neutral-700 rounded px-3 py-2 bg-white dark:bg-neutral-950 text-gray-900 dark:text-gray-100 disabled:opacity-100"
              />
            </div>
          </>
        )}

        {storageTarget === "LOCAL" && (
          <div>
            <label className="block text-sm mb-1 text-gray-700 dark:text-gray-300">Storage path</label>
            <input
              disabled={!editing}
              value={localPath}
              onChange={(e) => {
                  setLocalPath(e.target.value);
                  clearError()  
              }}
              className="w-full border border-gray-200 dark:border-neutral-700 rounded px-3 py-2 bg-white dark:bg-neutral-950 text-gray-900 dark:text-gray-100 disabled:opacity-100"
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

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs transition-opacity duration-300">
          <div className="bg-white dark:bg-neutral-900 rounded-xl shadow-2xl border border-gray-200 dark:border-neutral-800 w-full max-w-2xl max-h-[90vh] overflow-y-auto flex flex-col transform scale-100 transition-all duration-300 animate-in fade-in zoom-in-95">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-neutral-800 sticky top-0 bg-white dark:bg-neutral-900 z-10">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                <Info className="h-5 w-5 text-blue-500" />
                AWS S3 Integration Guide
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
                This platform uses secure <strong>AWS IAM Role Assumption (STS AssumeRole)</strong> to write and manage database backups directly in your S3 buckets. We never store permanent AWS credentials.
              </p>

              {/* Step 1 */}
              <div className="space-y-2">
                <h4 className="font-semibold text-gray-800 dark:text-gray-100 flex items-center gap-2">
                  <span className="flex items-center justify-center h-5 w-5 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-xs font-bold">1</span>
                  Create an IAM Policy
                </h4>
                <p className="pl-7">
                  Create a policy in your AWS account to permit S3 actions on your target bucket. Replace <code>YOUR_BUCKET_NAME</code> with your actual bucket name.
                </p>
                <div className="pl-7 relative">
                  <pre className="bg-gray-50 dark:bg-neutral-950 p-4 rounded-lg overflow-x-auto text-xs font-mono text-gray-800 dark:text-gray-200 border border-gray-200 dark:border-neutral-800">
                    {policyJson}
                  </pre>
                  <button
                    onClick={() => handleCopy(policyJson, 'policy')}
                    className="absolute top-2 right-4 bg-white dark:bg-neutral-900 hover:bg-gray-50 dark:hover:bg-neutral-800 border border-gray-200 dark:border-neutral-700 text-gray-600 dark:text-gray-300 p-1.5 rounded-md transition-colors flex items-center gap-1.5 text-xs shadow-xs cursor-pointer"
                  >
                    {copiedText === 'policy' ? (
                      <>
                        <Check className="h-3.5 w-3.5 text-green-500" />
                        <span>Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="h-3.5 w-3.5" />
                        <span>Copy JSON</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Step 2 */}
              <div className="space-y-2">
                <h4 className="font-semibold text-gray-800 dark:text-gray-100 flex items-center gap-2">
                  <span className="flex items-center justify-center h-5 w-5 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-xs font-bold">2</span>
                  Create IAM Role with Trust Policy
                </h4>
                <p className="pl-7">
                  Create a new IAM Role in your AWS account and configure its Trust Relationship. Paste the following Trust Policy to authorize our backend identity to assume the role.
                </p>
                <div className="pl-7 relative">
                  <pre className="bg-gray-50 dark:bg-neutral-950 p-4 rounded-lg overflow-x-auto text-xs font-mono text-gray-800 dark:text-gray-200 border border-gray-200 dark:border-neutral-800">
                    {trustJson}
                  </pre>
                  <button
                    onClick={() => handleCopy(trustJson, 'trust')}
                    className="absolute top-2 right-4 bg-white dark:bg-neutral-900 hover:bg-gray-50 dark:hover:bg-neutral-800 border border-gray-200 dark:border-neutral-700 text-gray-600 dark:text-gray-300 p-1.5 rounded-md transition-colors flex items-center gap-1.5 text-xs shadow-xs cursor-pointer"
                  >
                    {copiedText === 'trust' ? (
                      <>
                        <Check className="h-3.5 w-3.5 text-green-500" />
                        <span>Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="h-3.5 w-3.5" />
                        <span>Copy JSON</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Step 3 */}
              <div className="space-y-2">
                <h4 className="font-semibold text-gray-800 dark:text-gray-100 flex items-center gap-2">
                  <span className="flex items-center justify-center h-5 w-5 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-xs font-bold">3</span>
                  Configure Role ARN in Backup Settings
                </h4>
                <ul className="list-disc pl-12 space-y-1">
                  <li><strong>IAM Backup Upload Role ARN</strong> (Required): Paste the Role ARN here.</li>
                  <li><strong>IAM Backup Download/Restore Role ARN</strong> (Optional): Paste the Role ARN to support database restores.</li>
                  <li><strong>IAM Backup Delete Role ARN</strong> (Optional): Paste the Role ARN to enable automatic retention cleaning.</li>
                </ul>
                <p className="pl-7 text-xs text-gray-500 dark:text-gray-400">
                  Tip: You can use a single IAM Role containing all permissions (Upload, Restore, and Delete) across all inputs.
                </p>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 border-t border-gray-100 dark:border-neutral-800 flex justify-end bg-gray-50 dark:bg-neutral-900/50 rounded-b-xl sticky bottom-0 z-10">
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-neutral-900 hover:bg-gray-50 dark:hover:bg-neutral-800 border border-gray-300 dark:border-neutral-700 rounded-lg transition-colors cursor-pointer"
              >
                Close Guide
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default PrimaryStorageCard