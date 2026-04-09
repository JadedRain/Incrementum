#!/bin/bash

# Incrementum Kubernetes Deployment Script
set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
NAMESPACE="Incrementum"
IMAGE_TAG=${IMAGE_TAG:-latest}

echo -e "${GREEN}Starting Incrementum Kubernetes Deployment...${NC}"

# Check if kubectl is available
if ! command -v kubectl &> /dev/null; then
    echo -e "${RED}Error: kubectl is not installed or not in PATH${NC}"
    exit 1
fi

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

# Apply ConfigMap
echo -e "${YELLOW}Applying ConfigMaps...${NC}"
kubectl apply -f kubernetes/configmap.yaml

# Check if secrets exist, if not, create template
echo -e "${YELLOW}Checking secrets...${NC}"
if ! kubectl get secret incrementum-secrets -n $NAMESPACE &> /dev/null; then
    echo -e "${RED}Warning: incrementum-secrets not found!${NC}"
    echo -e "${YELLOW}You need to create the secret manually:${NC}"
    echo ""
    echo "kubectl create secret generic incrementum-secrets \\"
    echo "  --from-literal=django-secret-key='your-secret-key' \\"
    echo "  --from-literal=database-password='your-db-password' \\"
    echo "  --from-literal=finnhub-token='your-finnhub-token' \\"
    echo "  --from-literal=keycloak-realm-url='your-keycloak-url' \\"
    echo "  --from-literal=keycloak-client-secret='your-keycloak-secret' \\"
    echo "  --namespace=$NAMESPACE"
    echo ""
    echo -e "${YELLOW}Please create the secret and run this script again.${NC}"
    exit 1
else
    echo -e "${GREEN}✓ Secrets found${NC}"
fi

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