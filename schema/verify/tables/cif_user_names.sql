-- Verify cif:tables/cif_user_names on pg

BEGIN;

SELECT EXISTS (SELECT 1 
FROM information_schema.columns 
WHERE table_schema='cif' AND table_name='cif_user' AND column_name='given_name');

SELECT EXISTS (SELECT 1 
FROM information_schema.columns 
WHERE table_schema='cif' AND table_name='cif_user' AND column_name='family_name');

ROLLBACK;
