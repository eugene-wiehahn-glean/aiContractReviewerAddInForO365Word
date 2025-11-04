#!/bin/bash

# Create self-signed certificate for localhost
echo "Creating self-signed SSL certificate..."

mkdir -p certs

openssl req -x509 -newkey rsa:2048 -keyout certs/key.pem -out certs/cert.pem -days 365 -nodes -subj "/CN=localhost"

echo "Certificate created!"
echo ""
echo "Next steps:"
echo "1. Trust the certificate in Keychain Access"
echo "2. Run: npm run serve-https"
