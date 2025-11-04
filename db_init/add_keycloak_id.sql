-- Add keycloak_id column to account table
ALTER TABLE account ADD COLUMN keycloak_id VARCHAR(255) UNIQUE NULL;
