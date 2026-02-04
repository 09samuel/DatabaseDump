export type RestoreStatus ="QUEUED" | "IN_PROGRESS" | "COMPLETED" | "FAILED";

export type ApiRestore = {
  id: string;
  connection_id: string;
  backup_id: string;

  status: RestoreStatus;

  requested_at: string;
  started_at: string | null;
  finished_at: string | null;

  worker_id: string | null;
  attempt: number;
  error: string | null;
};
