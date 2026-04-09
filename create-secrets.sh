#!/bin/bash

# Script to create Kubernetes secrets from .env file
set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

ENV_FILE="${1:-.env}"
NAMESPACE="Incrementum"

echo -e "${GREEN}Creating Kubernetes secrets from $ENV_FILE${NC}"

# Check if .env file exists
if [[ ! -f "$ENV_FILE" ]]; then
    echo -e "${RED}Error: $ENV_FILE file not found!${NC}"
    echo -e "${YELLOW}Please copy .env.example to .env and fill in your values${NC}"
    echo "cp .env.example .env"
    exit 1
fi

# Source the .env file
echo -e "${YELLOW}Loading environment variables from $ENV_FILE...${NC}"
set -a  # automatically export all variables
source "$ENV_FILE"
set +a  # stop automatically exporting

# Validate required variables
required_vars=("DJANGO_SECRET_KEY" "DATABASE_PASSWORD")
missing_vars=()

for var in "${required_vars[@]}"; do
    if [[ -z "${!var}" ]]; then
        missing_vars+=("$var")
    fi
done

if [[ ${#missing_vars[@]} -gt 0 ]]; then
    echo -e "${RED}Error: Missing required environment variables:${NC}"
    for var in "${missing_vars[@]}"; do
        echo -e "${RED}  - $var${NC}"
    done
    echo -e "${YELLOW}Please update your $ENV_FILE file${NC}"
    exit 1
fi

# Set defaults for optional variables
FINNHUB_TOKEN=${FINNHUB_TOKEN:-"dummy-token"}
KEYCLOAK_REALM_URL=${KEYCLOAK_REALM_URL:-"http://dummy-keycloak"}
KEYCLOAK_CLIENT_SECRET=${KEYCLOAK_CLIENT_SECRET:-"dummy-secret"}

# Create namespace if it doesn't exist
echo -e "${YELLOW}Ensuring namespace exists...${NC}"
kubectl create namespace "$NAMESPACE" --dry-run=client -o yaml | kubectl apply -f -

# Delete existing secret if it exists
echo -e "${YELLOW}Removing existing secrets (if any)...${NC}"
kubectl delete secret incrementum-secrets -n "$NAMESPACE" --ignore-not-found

# Create the secret
echo -e "${YELLOW}Creating incrementum-secrets...${NC}"
kubectl create secret generic incrementum-secrets \
  --from-literal=django-secret-key="$DJANGO_SECRET_KEY" \
  --from-literal=database-password="$DATABASE_PASSWORD" \
  --from-literal=finnhub-token="$FINNHUB_TOKEN" \
  --from-literal=keycloak-realm-url="$KEYCLOAK_REALM_URL" \
  --from-literal=keycloak-client-secret="$KEYCLOAK_CLIENT_SECRET" \
  --namespace="$NAMESPACE"

echo -e "${GREEN}✅ Secrets created successfully!${NC}"
echo ""
echo -e "${YELLOW}Verify with:${NC}"
echo "kubectl get secrets -n $NAMESPACE"
echo "kubectl describe secret incrementum-secrets -n $NAMESPACE"