#!/bin/bash

# Azure Deployment Script for VPN Application
# Prerequisites: Azure CLI installed and logged in

set -e

echo "🚀 Starting Azure Deployment..."

# Configuration
RESOURCE_GROUP="vpn-app-rg"
LOCATION="eastus"
ACR_NAME="vpnappregistry"
APP_SERVICE_PLAN="vpn-app-plan"
WEBAPP_NAME="vpn-app-web"
POSTGRES_SERVER="vpn-postgres-server"
REDIS_NAME="vpn-redis-cache"

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}Step 1: Creating Resource Group...${NC}"
az group create --name $RESOURCE_GROUP --location $LOCATION

echo -e "${BLUE}Step 2: Creating Azure Container Registry...${NC}"
az acr create --resource-group $RESOURCE_GROUP --name $ACR_NAME --sku Basic --admin-enabled true

echo -e "${BLUE}Step 3: Building and Pushing Docker Images...${NC}"
az acr build --registry $ACR_NAME --image vpn-backend:latest ./backend
az acr build --registry $ACR_NAME --image vpn-frontend:latest ./frontend

echo -e "${BLUE}Step 4: Creating PostgreSQL Database...${NC}"
az postgres flexible-server create \
  --resource-group $RESOURCE_GROUP \
  --name $POSTGRES_SERVER \
  --location $LOCATION \
  --admin-user vpnadmin \
  --admin-password "YourSecurePassword123!" \
  --sku-name Standard_B1ms \
  --tier Burstable \
  --storage-size 32 \
  --version 14

az postgres flexible-server db create \
  --resource-group $RESOURCE_GROUP \
  --server-name $POSTGRES_SERVER \
  --database-name vpndb

echo -e "${BLUE}Step 5: Creating Redis Cache...${NC}"
az redis create \
  --resource-group $RESOURCE_GROUP \
  --name $REDIS_NAME \
  --location $LOCATION \
  --sku Basic \
  --vm-size c0

echo -e "${BLUE}Step 6: Creating App Service Plan...${NC}"
az appservice plan create \
  --name $APP_SERVICE_PLAN \
  --resource-group $RESOURCE_GROUP \
  --is-linux \
  --sku B2

echo -e "${BLUE}Step 7: Creating Web App...${NC}"
az webapp create \
  --resource-group $RESOURCE_GROUP \
  --plan $APP_SERVICE_PLAN \
  --name $WEBAPP_NAME \
  --deployment-container-image-name $ACR_NAME.azurecr.io/vpn-frontend:latest

echo -e "${BLUE}Step 8: Configuring Web App Settings...${NC}"
az webapp config appsettings set \
  --resource-group $RESOURCE_GROUP \
  --name $WEBAPP_NAME \
  --settings \
    DATABASE_URL="postgresql://vpnadmin@$POSTGRES_SERVER:YourSecurePassword123!@$POSTGRES_SERVER.postgres.database.azure.com:5432/vpndb?sslmode=require" \
    REDIS_URL="redis://$REDIS_NAME.redis.cache.windows.net:6379" \
    NODE_ENV="production"

echo -e "${GREEN}✅ Deployment Complete!${NC}"
echo -e "${GREEN}Web App URL: https://$WEBAPP_NAME.azurewebsites.net${NC}"
