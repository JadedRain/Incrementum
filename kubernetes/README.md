# Incrementum Kubernetes Deployment

This directory contains all the necessary Kubernetes manifests to deploy the Incrementum application to a Kubernetes cluster.

## Prerequisites

1. **Kubernetes cluster** - A running Kubernetes cluster (local or cloud)
2. **kubectl** - Configured to connect to your cluster
3. **Docker images** - Your application images pushed to a registry accessible by the cluster
4. **Ingress controller** - NGINX Ingress controller installed in your cluster
5. **cert-manager** (optional) - For automatic SSL certificate generation

## Quick Start

1. **Create the secrets** (required before deployment):
```bash
kubectl create secret generic incrementum-secrets \
  --from-literal=django-secret-key='your-django-secret-key' \
  --from-literal=database-password='your-database-password' \
  --from-literal=finnhub-token='your-finnhub-api-token' \
  --from-literal=keycloak-realm-url='your-keycloak-realm-url' \
  --from-literal=keycloak-client-secret='your-keycloak-client-secret' \
  --namespace=Incrementum
```

2. **Deploy everything**:
```bash
./deploy.sh
```

Or deploy manually:
```bash
# Deploy in order
kubectl apply -f namespace.yaml
kubectl apply -f configmap.yaml
kubectl apply -f postgres-configmap.yaml
kubectl apply -f postgres-pvc.yaml
kubectl apply -f database.yaml
kubectl apply -f api-deployment.yaml
kubectl apply -f api-service.yaml
kubectl apply -f client-deployment.yaml
kubectl apply -f client-service.yaml
kubectl apply -f ingress.yaml
```

## Configuration

### Environment Variables
Update [configmap.yaml](configmap.yaml) with your specific configuration:
- Update the domain names to match your setup
- Modify any other environment-specific values

### Secrets
The application requires these secrets:
- `django-secret-key`: Django secret key for the API
- `database-password`: PostgreSQL password
- `finnhub-token`: Finnhub API token for stock data
- `keycloak-realm-url`: Keycloak realm URL for authentication
- `keycloak-client-secret`: Keycloak client secret

### Images
Update the image references in the deployment files:
- `nhowell02/incrementum_api:${IMAGE_TAG}`
- `nhowell02/incrementum_client:${IMAGE_TAG}`

Set the `IMAGE_TAG` environment variable before deploying:
```bash
export IMAGE_TAG=v1.0.0
./deploy.sh
```

## Components

- **Namespace**: `Incrementum` - Isolates all resources
- **PostgreSQL**: Database with persistent storage and init scripts
- **API**: Django backend application
- **Client**: React frontend application  
- **Ingress**: Routes traffic to API and Client with SSL termination

## Monitoring

Check deployment status:
```bash
kubectl get pods -n Incrementum
kubectl get services -n Incrementum
kubectl get ingress -n Incrementum
```

View logs:
```bash
kubectl logs -n Incrementum deployment/incrementum-api
kubectl logs -n Incrementum deployment/incrementum-client
kubectl logs -n Incrementum deployment/postgres-db
```

## Scaling

Scale deployments:
```bash
kubectl scale deployment incrementum-api --replicas=3 -n Incrementum
kubectl scale deployment incrementum-client --replicas=2 -n Incrementum
```

## Cleanup

To remove the entire deployment:
```bash
./cleanup.sh
```

## Troubleshooting

### Common Issues

1. **Pods not starting**: Check events and logs
   ```bash
   kubectl describe pod -n Incrementum
   kubectl logs -n Incrementum <pod-name>
   ```

2. **Database connection issues**: Ensure PostgreSQL is ready
   ```bash
   kubectl exec -it deployment/postgres-db -n Incrementum -- psql -U Incr -d Incr_DB
   ```

3. **Ingress not working**: Check ingress controller and DNS
   ```bash
   kubectl get ingress -n Incrementum
   kubectl describe ingress incrementum-ingress -n Incrementum
   ```

4. **Image pull errors**: Verify image names and registry access

### Useful Commands

```bash
# Port forward to access services locally
kubectl port-forward -n Incrementum service/incrementum-api-service 8000:80
kubectl port-forward -n Incrementum service/incrementum-client-service 3000:80

# Access database directly
kubectl exec -it deployment/postgres-db -n Incrementum -- psql -U Incr -d Incr_DB

# View all resources in namespace
kubectl get all -n Incrementum
```

## Production Considerations

- [ ] Use proper secrets management (Azure Key Vault, AWS Secrets Manager, etc.)
- [ ] Configure resource limits and requests appropriately
- [ ] Set up monitoring and alerting
- [ ] Configure backups for the database
- [ ] Use a proper storage class for persistent volumes
- [ ] Configure network policies for security
- [ ] Set up horizontal pod autoscaling
- [ ] Use init containers for database migrations