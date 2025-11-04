# AWS Deployment for Word Add-in

This directory contains CloudFormation templates and scripts to deploy the Glean Legal Redlining Word Add-in to AWS.

## Architecture

- **S3 Bucket**: Hosts static files (HTML, JS, CSS)
- **CloudFront**: CDN with HTTPS, caching, and security headers
- **WAF**: Web Application Firewall with AWS managed rules
- **Origin Access Control (OAC)**: Secure S3 access (latest best practice)
- **ACM Certificate**: SSL/TLS certificate for custom domain

## Prerequisites

1. **AWS CLI** configured with your AWS profile
2. **ACM Certificate** already created in `us-east-1` for your custom domain
3. **Route53 hosted zone** for your domain (you'll manually create CNAME)
4. **Environment variables** configured in `.env` file (see `.env.example`)

## Deployment Steps

### 1. Deploy the CloudFormation Stack

```bash
cd cloudformation
chmod +x deploy.sh
./deploy.sh
```

This will:
- Create S3 bucket with encryption and versioning
- Create CloudFront distribution with WAF
- Upload add-in files to S3
- Create CloudFront invalidation

### 2. Configure Route53

After deployment, the script will output the CloudFront domain name. Create a CNAME record:

```
Name: your-domain.com
Type: CNAME
Value: <CloudFront-Domain-Name-from-output>
TTL: 300
```

### 3. Test the Deployment

Once DNS propagates (usually 5-10 minutes):

```bash
curl -I https://your-domain.com/taskpane.html
```

You should see a `200 OK` response.

### 4. Use the Production Manifest

Upload `manifest-production.xml` to Word:
- Word Desktop: **Insert** → **Get Add-ins** → **My Add-ins** → **Upload My Add-in**
- Word Online: **Insert** → **Office Add-ins** → **Upload My Add-in**

## Stack Details

### Resources Created

- **S3 Bucket**: `word-addin-hosting-prod`
  - Encryption: AES256
  - Versioning: Enabled
  - Public access: Blocked
  - Access: CloudFront OAC only

- **CloudFront Distribution**
  - Custom domain: Your configured domain
  - HTTPS only (redirects HTTP)
  - Caching: Optimized for static content
  - Compression: Enabled
  - HTTP/2 and HTTP/3: Enabled

- **WAF Web ACL**
  - AWS Core Rule Set
  - Known Bad Inputs protection
  - Rate limiting: 2000 req/5min per IP

### Security Features

1. **S3 Security**
   - All public access blocked
   - Server-side encryption
   - Versioning enabled
   - Access only via CloudFront OAC

2. **CloudFront Security**
   - HTTPS enforced (TLS 1.2+)
   - Security headers via response policy
   - CORS configured for Office.js

3. **WAF Protection**
   - Common attack patterns blocked
   - SQL injection protection
   - Rate limiting per IP

## Updating the Add-in

To update the add-in files:

```bash
cd cloudformation
./deploy.sh
```

This will sync new files to S3 and invalidate the CloudFront cache.

## Manual Deployment (Alternative)

If you prefer to deploy manually:

```bash
# Set your AWS profile
export AWS_PROFILE=your-aws-profile
export AWS_REGION=us-east-1

# 1. Deploy stack
aws cloudformation deploy \
  --template-file word-addin-hosting.yaml \
  --stack-name word-addin-hosting \
  --region $AWS_REGION \
  --profile $AWS_PROFILE \
  --capabilities CAPABILITY_NAMED_IAM

# 2. Get bucket name
BUCKET=$(aws cloudformation describe-stacks \
  --stack-name word-addin-hosting \
  --region $AWS_REGION \
  --profile $AWS_PROFILE \
  --query 'Stacks[0].Outputs[?OutputKey==`WebsiteBucketName`].OutputValue' \
  --output text)

# 3. Upload files
cd ../word-addin
aws s3 cp taskpane.html s3://$BUCKET/ --profile $AWS_PROFILE
aws s3 cp commands.html s3://$BUCKET/ --profile $AWS_PROFILE
aws s3 sync src s3://$BUCKET/src/ --profile $AWS_PROFILE

# 4. Get distribution ID
DIST_ID=$(aws cloudformation describe-stacks \
  --stack-name word-addin-hosting \
  --region $AWS_REGION \
  --profile $AWS_PROFILE \
  --query 'Stacks[0].Outputs[?OutputKey==`CloudFrontDistributionId`].OutputValue' \
  --output text)

# 5. Invalidate cache
aws cloudfront create-invalidation \
  --distribution-id $DIST_ID \
  --profile $AWS_PROFILE \
  --paths "/*"
```

## Troubleshooting

### CloudFormation Stack Fails

Check the CloudFormation console for detailed error messages:
```bash
aws cloudformation describe-stack-events \
  --stack-name word-addin-hosting \
  --region $AWS_REGION \
  --profile $AWS_PROFILE
```

### Files Not Updating

1. Check S3 bucket contents:
```bash
aws s3 ls s3://$BUCKET/ --recursive --profile $AWS_PROFILE
```

2. Create CloudFront invalidation:
```bash
aws cloudfront create-invalidation \
  --distribution-id $DIST_ID \
  --profile $AWS_PROFILE \
  --paths "/*"
```

### SSL Certificate Issues

Ensure the ACM certificate:
- Is in `us-east-1` region (required for CloudFront)
- Covers your custom domain
- Is validated and issued

### WAF Blocking Legitimate Traffic

Check WAF logs in CloudWatch:
```bash
aws wafv2 list-web-acls \
  --scope CLOUDFRONT \
  --region $AWS_REGION \
  --profile $AWS_PROFILE
```

## Cost Estimate

Monthly costs (approximate):
- S3: $0.023/GB storage + $0.09/GB transfer
- CloudFront: $0.085/GB (first 10TB)
- WAF: $5/month + $1/rule + $0.60/million requests
- Route53: $0.50/hosted zone

Estimated total: ~$10-20/month for moderate usage

## Cleanup

To delete all resources:

```bash
# Empty S3 bucket first
aws s3 rm s3://$BUCKET --recursive --profile $AWS_PROFILE

# Delete stack
aws cloudformation delete-stack \
  --stack-name word-addin-hosting \
  --region $AWS_REGION \
  --profile $AWS_PROFILE
```

## Support

For issues:
1. Check CloudFormation events
2. Check CloudWatch logs
3. Verify Route53 DNS propagation
4. Test with `curl -I https://your-domain.com/taskpane.html`
