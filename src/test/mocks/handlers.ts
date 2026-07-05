import { http, HttpResponse } from "msw";

export const handlers = [
    // Dry run connection verification
    http.post("http://localhost:3000/connections/verify-dry-run", async ({ request }) => {
        const body = await request.json() as any;

        // Simple mock validation rule: fail if password is 'fail-pass'
        if (body.dbUserSecret === "fail-pass") {
            return new HttpResponse(
                JSON.stringify({ message: "Verification failed. Please check credentials." }),
                { status: 400, headers: { "Content-Type": "application/json" } }
            );
        }

        return HttpResponse.json({ success: true });
    }),

    //Add database connection
    http.post("http://localhost:3000/connections", async () => {
        return HttpResponse.json({
            connection: {
                id: "conn-123-mock",
                db_name: "test-db",
                db_type: "postgresql",
                env_tag: "production",
                status: "CREATED",
                lastBackupAt: null,
                backupStatus: null,
                storageUsedGB: 0
            }
        });
    }),

    //Initiate verification
    http.post("http://localhost:3000/connections/:id/verify", async () => {
        return HttpResponse.json({ status: "VERIFYING" });
    }),

    //Polling connection status
    //We will let the test override this handler dynamically when testing success/error transitions
    http.get("http://localhost:3000/connections/:id/status", async () => {
        return HttpResponse.json({ status: "VERIFIED" });
    }),

    http.get("http://localhost:3000/connections/summary", () => {
        return HttpResponse.json({
            data: [
                {
                    id: "db-01",
                    db_name: "ProductionDB",
                    db_type: "postgresql",
                    env_tag: "production",
                    status: "VERIFIED",
                    lastBackupAt: "2026-07-04T12:00:00Z",
                    backupStatus: "COMPLETED",
                    storageUsedGB: 45.2,
                },
                {
                    id: "db-02",
                    db_name: "StagingDB",
                    db_type: "mysql",
                    env_tag: "staging",
                    status: "VERIFIED",
                    lastBackupAt: null,
                    backupStatus: null,
                    storageUsedGB: 1.5,
                }
            ]
        });
    })
];
