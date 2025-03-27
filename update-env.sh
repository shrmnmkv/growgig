#!/bin/bash

# Get the current EC2 public IP using an external service
PUBLIC_IP=$(curl -s https://api.ipify.org)

# Update frontend .env.production
echo "VITE_API_URL=http://$PUBLIC_IP/api" > /var/www/growgig/.env.production

# Rebuild frontend
cd /var/www/growgig
npm run build

# Restart Nginx
sudo systemctl restart nginx

echo "Environment updated with IP: $PUBLIC_IP" 