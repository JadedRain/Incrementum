#!/bin/bash

# Incrementum Kubernetes Cleanup/Rollback Script
set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

NAMESPACE="incrementum"

echo -e "${YELLOW}Cleaning up Incrementum deployment...${NC}"

# Delete ingress first
echo -e "${YELLOW}Deleting ingress...${NC}"
kubectl delete -f kubernetes/ingress.yaml --ignore-not-found

# Delete services
echo -e "${YELLOW}Deleting services...${NC}"
kubectl delete -f kubernetes/api-service.yaml --ignore-not-found
kubectl delete -f kubernetes/client-service.yaml --ignore-not-found

# Delete deployments
echo -e "${YELLOW}Deleting deployments...${NC}"
kubectl delete deployment incrementum-api -n $NAMESPACE --ignore-not-found
kubectl delete deployment incrementum-client -n $NAMESPACE --ignore-not-found

# Delete ConfigMaps
echo -e "${YELLOW}Deleting ConfigMaps...${NC}"
kubectl delete -f kubernetes/configmap.yaml --ignore-not-found

# Database is managed externally - skipping database cleanup

# Ask if user wants to delete secrets
echo -e "${YELLOW}Do you want to delete secrets? (y/N)${NC}"
read -r response
if [[ "$response" =~ ^([yY][eE][sS]|[yY])$ ]]; then
    echo -e "${YELLOW}Deleting secrets...${NC}"
    kubectl delete secret incrementum-secrets -n $NAMESPACE --ignore-not-found
fi

# Ask if user wants to delete namespace
echo -e "${YELLOW}Do you want to delete the entire namespace? (y/N)${NC}"
read -r response
if [[ "$response" =~ ^([yY][eE][sS]|[yY])$ ]]; then
    echo -e "${YELLOW}Deleting namespace...${NC}"
    kubectl delete namespace $NAMESPACE --ignore-not-found
fi

echo -e "${GREEN}✅ Cleanup completed!${NC}"