#!/bin/bash

set -e

# Load environment variables from .env file
if [ -f ../.env ]; then
    set -a
    source ../.env
    set +a
else
    echo "Error: .env file not found in parent directory"
    echo "Please create a .env file from .env.example and configure it"
    exit 1
fi

# Validate required environment variables
if [ -z "$AWS_PROFILE" ]; then
    echo "Error: AWS_PROFILE not set in .env"
    exit 1
fi

if [ -z "$AWS_REGION" ]; then
    echo "Warning: AWS_REGION not set, using default us-east-1"
    AWS_REGION="us-east-1"
fi

STACK_NAME="word-addin-hosting"
REGION="$AWS_REGION"
PROFILE="$AWS_PROFILE"

echo "========================================="
echo "Deploying Word Add-in to AWS"
echo "========================================="
echo "Profile: $PROFILE"
echo "Region: $REGION"
echo ""

# Deploy CloudFormation stack
echo "Step 1: Deploying CloudFormation stack..."
aws cloudformation deploy \
  --template-file word-addin-hosting.yaml \
  --stack-name $STACK_NAME \
  --region $REGION \
  --profile $PROFILE \
  --capabilities CAPABILITY_NAMED_IAM \
  --no-fail-on-empty-changeset

echo ""
echo "Step 2: Getting stack outputs..."
BUCKET_NAME=$(aws cloudformation describe-stacks \
  --stack-name $STACK_NAME \
  --region $REGION \
  --profile $PROFILE \
  --query 'Stacks[0].Outputs[?OutputKey==`WebsiteBucketName`].OutputValue' \
  --output text)

DISTRIBUTION_ID=$(aws cloudformation describe-stacks \
  --stack-name $STACK_NAME \
  --region $REGION \
  --profile $PROFILE \
  --query 'Stacks[0].Outputs[?OutputKey==`CloudFrontDistributionId`].OutputValue' \
  --output text)

CF_DOMAIN=$(aws cloudformation describe-stacks \
  --stack-name $STACK_NAME \
  --region $REGION \
  --profile $PROFILE \
  --query 'Stacks[0].Outputs[?OutputKey==`CloudFrontDomainName`].OutputValue' \
  --output text)

WEBSITE_URL=$(aws cloudformation describe-stacks \
  --stack-name $STACK_NAME \
  --region $REGION \
  --profile $PROFILE \
  --query 'Stacks[0].Outputs[?OutputKey==`WebsiteURL`].OutputValue' \
  --output text)

API_URL=$(aws cloudformation describe-stacks \
  --stack-name $STACK_NAME \
  --region $REGION \
  --profile $PROFILE \
  --query 'Stacks[0].Outputs[?OutputKey==`ApiGatewayUrl`].OutputValue' \
  --output text)

echo "Bucket Name: $BUCKET_NAME"
echo "Distribution ID: $DISTRIBUTION_ID"
echo "CloudFront Domain: $CF_DOMAIN"
echo "Website URL: $WEBSITE_URL"
echo "API Gateway URL: $API_URL"
echo ""

# Update taskpane.js with API Gateway URL
echo "Step 3: Updating taskpane.js with API Gateway URL..."
cd ../word-addin
sed -i.bak "s|API_GATEWAY_URL_PLACEHOLDER|$API_URL|g" src/taskpane.js
rm src/taskpane.js.bak
echo "Updated taskpane.js with API URL: $API_URL"
echo ""

# Upload files to S3
echo "Step 4: Uploading files to S3..."

# Upload HTML, JS, CSS files
aws s3 sync . s3://$BUCKET_NAME/ \
  --profile $PROFILE \
  --region $REGION \
  --exclude "*" \
  --include "*.html" \
  --include "*.js" \
  --include "*.css" \
  --include "src/*" \
  --include "assets/*" \
  --content-type "text/html" \
  --cache-control "max-age=300"

# Set correct content types
aws s3 cp taskpane.html s3://$BUCKET_NAME/taskpane.html \
  --profile $PROFILE \
  --region $REGION \
  --content-type "text/html" \
  --cache-control "max-age=300"

aws s3 cp commands.html s3://$BUCKET_NAME/commands.html \
  --profile $PROFILE \
  --region $REGION \
  --content-type "text/html" \
  --cache-control "max-age=300"

aws s3 cp src/taskpane.js s3://$BUCKET_NAME/src/taskpane.js \
  --profile $PROFILE \
  --region $REGION \
  --content-type "application/javascript" \
  --cache-control "max-age=300"

echo ""
echo "Step 5: Creating CloudFront invalidation..."
aws cloudfront create-invalidation \
  --distribution-id $DISTRIBUTION_ID \
  --profile $PROFILE \
  --paths "/*" \
  --query 'Invalidation.Id' \
  --output text

echo ""
echo "========================================="
echo "Deployment Complete!"
echo "========================================="
echo ""
echo "Configuration:"
echo "  Website URL: $WEBSITE_URL"
echo "  API Gateway URL: $API_URL"
echo "  CloudFront Domain: $CF_DOMAIN"
echo ""
echo "Next Steps:"
echo "1. DNS is already configured ✓"
echo "2. Test the add-in at: $WEBSITE_URL/taskpane.html"
echo "3. Upload manifest-production.xml to Word"
echo "4. Click 'Analyze Document' to test the Lambda proxy"
echo ""
