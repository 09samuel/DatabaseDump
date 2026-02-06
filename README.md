# Database Dump 

A **SaaS-based database backup and recovery service** that enables automated, secure, and reliable backups of client databases to **client-managed AWS S3**.  
The system supports **MySQL, PostgreSQL, and MongoDB**, with features such as **scheduled backups, retention policies, compression, checksum validation, restore, and download**.

> ⚠️ **Note**  
> The backend service is maintained in a **separate repository** named **[`db-dump-backend`](https://github.com/09samuel/db-dump-backend)**, which contains the core backup engine, schedulers, and AWS S3 integration.

---

##  Features

- **Automated Scheduled Backups** using configurable schedules  
- **Retention Policy Management** to control backup lifecycle  
- **Client-Managed AWS S3 Storage** for secure, tenant-isolated backups  
- **Compression & Checksum Validation** to reduce size and ensure integrity  
- **Restore & On-Demand Download** of database backups  
- **Multi-Tenant Architecture** with secure access control  

---

## Supported Databases

- MySQL  
- PostgreSQL  
- MongoDB  


---

## Tech Stack

- **Backend:** Node.js, Express.js  
- **Database:** PostgreSQL
- **Storage:** Client-managed AWS S3  
- **Scheduling:** Cron jobs / background workers  
- **Security:** IAM-based access, checksum verification  

---

## Backup Workflow

1. Scheduler triggers a backup job  
2. Database dump is generated (`mysqldump`, `pg_dump`, `mongodump`)  
3. Dump file is compressed  
4. Checksum is generated for integrity validation  
5. Backup is uploaded to the client’s S3 bucket  
6. Retention policies are applied  

---

## Restore Workflow

1. Select a backup version  
2. Download backup from S3  
3. Verify checksum  
4. Decompress backup  
5. Restore database  

---

## Security Considerations

- Uses **client-provided AWS IAM Role ARN** for secure access to client-managed S3 buckets  
- Requires clients to create IAM roles with **least-privilege permissions**  
- Access is granted via **temporary role assumption** (no long-term AWS credentials stored)  
- Database credentials are not persisted beyond backup execution  
- **Checksum-based integrity validation** is performed before restore operations  


---

## Performance & Optimization

- Achieves **30–50% reduction in backup size** using compression  
- Handles **hundreds of scheduled backup jobs per day**  
- Designed to minimize load on production databases  

---

##  Repository Structure

- **Frontend / Control Plane:** This repository  
- **Backend:** [API Backend](https://github.com/09samuel/db-dump-backend)** (separate repository)  

---

## Future Enhancements

- Encryption at rest and in transit  
- Notifications and alerts (email / webhook)   


---

