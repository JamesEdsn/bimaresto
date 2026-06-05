-- scripts/delete-menus-1-2.sql
-- WARNING: destructive operation. Make sure you have a DB backup/snapshot before running.
-- This script shows which rows will be removed and then deletes them in a single transaction.

BEGIN;

-- Preview rows that reference the menus to be deleted
SELECT oi.id, oi.order_id, oi.menu_id, o.client_ref_id, o.created_at
FROM order_items oi
JOIN orders o ON o.id = oi.order_id
WHERE oi.menu_id IN (1,2);

-- If the preview looks OK, the following DELETEs will remove the dependent order_items
-- and then delete the menus themselves.

DELETE FROM order_items WHERE menu_id IN (1,2);
DELETE FROM menus WHERE id IN (1,2);

COMMIT;
