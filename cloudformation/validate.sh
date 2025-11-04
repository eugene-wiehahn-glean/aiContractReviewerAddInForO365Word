#!/bin/bash

DOMAIN="wordredlining.gleandemo.com"

echo "========================================="
echo "Validating Word Add-in Deployment"
echo "========================================="
echo ""

# Test DNS resolution
echo "1. Testing DNS resolution..."
if host $DOMAIN > /dev/null 2>&1; then
    echo "✓ DNS resolves for $DOMAIN"
    host $DOMAIN
else
    echo "✗ DNS does not resolve for $DOMAIN"
    echo "  Make sure you've created the Route53 CNAME record"
fi
echo ""

# Test HTTPS connection
echo "2. Testing HTTPS connection..."
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" https://$DOMAIN/taskpane.html)
if [ "$HTTP_CODE" = "200" ]; then
    echo "✓ HTTPS connection successful (HTTP $HTTP_CODE)"
else
    echo "✗ HTTPS connection failed (HTTP $HTTP_CODE)"
fi
echo ""

# Test SSL certificate
echo "3. Testing SSL certificate..."
if openssl s_client -connect $DOMAIN:443 -servername $DOMAIN </dev/null 2>/dev/null | grep -q "Verify return code: 0"; then
    echo "✓ SSL certificate is valid"
else
    echo "✗ SSL certificate validation failed"
fi
echo ""

# Test CORS headers
echo "4. Testing CORS headers..."
CORS_HEADER=$(curl -s -I https://$DOMAIN/taskpane.html | grep -i "access-control-allow-origin")
if [ -n "$CORS_HEADER" ]; then
    echo "✓ CORS headers present"
    echo "  $CORS_HEADER"
else
    echo "⚠ CORS headers not found (may be OK if not needed)"
fi
echo ""

# Test security headers
echo "5. Testing security headers..."
HEADERS=$(curl -s -I https://$DOMAIN/taskpane.html)

if echo "$HEADERS" | grep -qi "strict-transport-security"; then
    echo "✓ HSTS header present"
else
    echo "⚠ HSTS header missing"
fi

if echo "$HEADERS" | grep -qi "x-content-type-options"; then
    echo "✓ X-Content-Type-Options header present"
else
    echo "⚠ X-Content-Type-Options header missing"
fi
echo ""

# Test file accessibility
echo "6. Testing file accessibility..."
for file in "taskpane.html" "commands.html" "src/taskpane.js"; do
    HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" https://$DOMAIN/$file)
    if [ "$HTTP_CODE" = "200" ]; then
        echo "✓ $file accessible (HTTP $HTTP_CODE)"
    else
        echo "✗ $file not accessible (HTTP $HTTP_CODE)"
    fi
done
echo ""

# Test Office.js loading
echo "7. Testing Office.js reference..."
if curl -s https://$DOMAIN/taskpane.html | grep -q "appsforoffice.microsoft.com/lib"; then
    echo "✓ Office.js CDN reference found"
else
    echo "✗ Office.js CDN reference not found"
fi
echo ""

echo "========================================="
echo "Validation Complete"
echo "========================================="
echo ""
echo "If all tests pass, you can:"
echo "1. Upload manifest-production.xml to Word"
echo "2. Test the add-in in Word"
echo ""
