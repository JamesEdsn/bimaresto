Delete menus 1 & 2 (destructive)

Purpose:
- Remove `order_items` that reference `menus.id IN (1,2)` and then delete the menus.

Important:
- This is destructive: it permanently removes order_items (historical data). Take a DB backup or snapshot before running.

How to run (Neon SQL editor / psql / DBeaver):

1) Preview the rows that will be removed (recommended):

```sql
SELECT oi.id, oi.order_id, oi.menu_id, o.client_ref_id, o.created_at
FROM order_items oi
JOIN orders o ON o.id = oi.order_id
WHERE oi.menu_id IN (1,2);
```

2) Run the prepared script (from the repo):

Using `psql` (replace credentials as needed):

```powershell
psql "host=ep-spring-dream-aq9yj8s2-pooler.c-8.us-east-1.aws.neon.tech port=5432 user=neondb_owner password=npg_KQLi3mw1WDSj dbname=bimaresto sslmode=require" -f ./scripts/delete-menus-1-2.sql
```

3) Verify:

```sql
SELECT * FROM menus WHERE id IN (1,2);
SELECT * FROM order_items WHERE menu_id IN (1,2);
```

If you want me to run the SQL here I cannot access your DB credentials; run the script and paste the output or errors and I will help interpret and follow up.
