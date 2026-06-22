# Reset local PostgreSQL database

Use this only for local/dev databases. The reset drops every object in the `public` schema and lets Flyway recreate the canonical schema from `src/main/resources/db/migration/V1__init_schema.sql`.

## 1. Backup current database

```powershell
pg_dump `
  --dbname="postgresql://autowash:autowash@localhost:5432/autowash" `
  --file="autowash-backup-before-reset.sql"
```

If you use different credentials, replace the connection string with values from `AUTOWASH_DB_URL`, `AUTOWASH_DB_USERNAME`, and `AUTOWASH_DB_PASSWORD`.

## 2. Drop and recreate the public schema

```powershell
psql "postgresql://autowash:autowash@localhost:5432/autowash" `
  -c "DROP SCHEMA IF EXISTS public CASCADE; CREATE SCHEMA public;"
```

## 3. Run Flyway through the app

Start the backend normally. Flyway runs on startup because `spring.flyway.enabled=true`.

```powershell
mvn spring-boot:run
```

## 4. Verify schema alignment

Run the backend test suite after the database reset:

```powershell
mvn test
```

The expected canonical identity/customer tables are `users`, `user_preferences`, `refresh_tokens`, `otp_verifications`, and `vehicles`. Old tables such as `auth_users`, `customer_vehicles`, and `otp_records` should not exist after this reset.
