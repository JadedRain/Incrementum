#!/bin/bash

# Incrementum Kubernetes Deployment Script using .env.kubernetes
set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
NAMESPACE="incrementum"
ENV_FILE=".env.kubernetes"

echo -e "${GREEN}Starting Incrementum Kubernetes Deployment from $ENV_FILE...${NC}"

# Check if kubectl is available
if ! command -v kubectl &> /dev/null; then
    echo -e "${RED}Error: kubectl is not installed or not in PATH${NC}"
    exit 1
fi

# Check if .env.kubernetes file exists
if [[ ! -f "$ENV_FILE" ]]; then
    echo -e "${RED}Error: $ENV_FILE file not found!${NC}"
    exit 1
fi

# Load environment variables from .env.kubernetes
echo -e "${YELLOW}Loading environment variables from $ENV_FILE...${NC}"
set -a  # automatically export all variables
source "$ENV_FILE"
set +a  # stop automatically exporting

# Set default IMAGE_TAG if not specified
IMAGE_TAG=${IMAGE_TAG:-latest}

# Check cluster connectivity
echo -e "${YELLOW}Checking cluster connectivity...${NC}"
if ! kubectl cluster-info &> /dev/null; then
    echo -e "${RED}Error: Cannot connect to Kubernetes cluster${NC}"
    exit 1
fi

echo -e "${GREEN}✓ Connected to cluster${NC}"

# Create namespace
echo -e "${YELLOW}Creating namespace...${NC}"
kubectl apply -f kubernetes/namespace.yaml

# Create ConfigMap from environment variables
echo -e "${YELLOW}Creating ConfigMap from environment variables...${NC}"
kubectl create configmap incrementum-config \
    --from-literal=DEBUG="$DEBUG" \
    --from-literal=CSRF_TRUSTED_ORIGINS="$CSRF_TRUSTED_ORIGINS" \
    --from-literal=CORS_ALLOWED_ORIGINS="$CORS_ALLOWED_ORIGINS" \
    --from-literal=ALLOWED_HOSTS="$ALLOWED_HOSTS" \
    --from-literal=DATABASE_NAME="$DATABASE_NAME" \
    --from-literal=DATABASE_USER="$DATABASE_USER" \
    --from-literal=DATABASE_HOST="$DATABASE_HOST" \
    --from-literal=DATABASE_PORT="$DATABASE_PORT" \
    --from-literal=KEYCLOAK_CLIENT_ID="$KEYCLOAK_CLIENT_ID" \
    --from-literal=VITE_API_BASE_URL="$VITE_API_BASE_URL" \
    --from-literal=VITE_DASH_BASE_URL="$VITE_DASH_BASE_URL" \
    --namespace="$NAMESPACE" \
    --dry-run=client -o yaml | kubectl apply -f -

# Create secrets from environment variables
echo -e "${YELLOW}Creating secrets from environment variables...${NC}"
kubectl create secret generic incrementum-secrets \
    --from-literal=django-secret-key="$DJANGO_SECRET_KEY" \
    --from-literal=database-password="$DATABASE_PASSWORD" \
    --from-literal=finnhub-token="$FINNHUB_TOKEN" \
    --from-literal=keycloak-realm-url="$KEYCLOAK_REALM_URL" \
    --from-literal=keycloak-client-secret="$KEYCLOAK_CLIENT_SECRET" \
    --namespace="$NAMESPACE" \
    --dry-run=client -o yaml | kubectl apply -f -

echo -e "${GREEN}✓ ConfigMap and Secrets created${NC}"

# External database is managed separately - skipping database deployment

# Deploy API
echo -e "${YELLOW}Deploying API with image tag: $IMAGE_TAG${NC}"
# Replace image tag placeholder
sed "s/\${IMAGE_TAG}/$IMAGE_TAG/g" kubernetes/api-deployment.yaml | kubectl apply -f -
kubectl apply -f kubernetes/api-service.yaml

# Deploy Client
echo -e "${YELLOW}Deploying Client with image tag: $IMAGE_TAG${NC}"
sed "s/\${IMAGE_TAG}/$IMAGE_TAG/g" kubernetes/client-deployment.yaml | kubectl apply -f -
kubectl apply -f kubernetes/client-service.yaml

# Apply Ingress
echo -e "${YELLOW}Applying Ingress...${NC}"
kubectl apply -f kubernetes/ingress.yaml

# Wait for deployments
echo -e "${YELLOW}Waiting for deployments to be ready...${NC}"
kubectl wait --for=condition=available --timeout=300s deployment/incrementum-api -n $NAMESPACE
kubectl wait --for=condition=available --timeout=300s deployment/incrementum-client -n $NAMESPACE

echo -e "${GREEN}✅ Deployment completed successfully!${NC}"
echo ""
echo -e "${YELLOW}Check status with:${NC}"
echo "kubectl get pods -n $NAMESPACE"
echo "kubectl get services -n $NAMESPACE"
echo "kubectl get ingress -n $NAMESPACE"
echo ""
echo -e "${YELLOW}Check logs with:${NC}"
echo "kubectl logs -n $NAMESPACE deployment/incrementum-api"
echo "kubectl logs -n $NAMESPACE deployment/incrementum-client"
echo ""
echo -e "${YELLOW}Environment loaded from: $ENV_FILE${NC}"
echo -e "${YELLOW}Image tag used: $IMAGE_TAG${NC}"