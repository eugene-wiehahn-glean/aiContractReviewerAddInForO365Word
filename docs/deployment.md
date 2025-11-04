# Deployment Guide

This guide covers deploying the AI Contract Reviewer to both local development and AWS production environments.

## Prerequisites

Before deploying, ensure you have:

- ✅ Node.js 18+ and npm installed
- ✅ AWS CLI configured with appropriate credentials
- ✅ Microsoft Word (Desktop or Online)
- ✅ Glean account with API access
- ✅ Glean agent configured for contract review

## Quick Start

The fastest way to get started:

```bash
# Clone and setup
git clone https://github.com/eugene-wiehahn-glean/aiContractReviewerAddInForO365Word.git
cd aiContractReviewerAddInForO365Word
./setup.sh
```

The setup script will guide you through configuration and deployment.

## Local Development Deployment

### 1. Install Dependencies

```bash
npm install
cd word-addin && npm install && cd ..
```

### 2. Configure Environment

Create your `.env` file from the template:

```bash
cp .env.example .env
```

**Note:** The `setup.sh` script does this automatically. This manual step is only needed if you're not using the setup script.

Edit `.env` and configure your credentials:

```bash
GLEAN_API_TOKEN=your_token_here
GLEAN_INSTANCE=your-instance
GLEAN_AGENT_ID=your_agent_id
```

### 3. Start Development Server

```bash
cd word-addin
npm run serve-https
```

This starts a local HTTPS server on `https://localhost:3000`.

### 4. Trust Self-Signed Certificate

**macOS**:
```bash
# Certificate is auto-generated in word-addin/certs/
sudo security add-trusted-cert -d -r trustRoot -k /Library/Keychains/System.keychain word-addin/certs/localhost.crt
```

**Windows**:
1. Open `word-addin/certs/localhost.crt`
2. Click "Install Certificate"
3. Select "Local Machine"
4. Place in "Trusted Root Certification Authorities"

### 5. Sideload Add-in

**Word Desktop**:
1. Open Word
2. Insert → Get Add-ins → My Add-ins
3. Upload `word-addin/manifest.xml`

**Word Online**:
- Not supported for localhost (use AWS deployment)

### 6. Test

1. Open the add-in in Word
2. Configure with your Glean credentials
3. Paste a test contract
4. Click "Analyze Document"

## AWS Production Deployment

### 1. Prerequisites

Ensure you have:

- AWS CLI configured with admin access
- ACM certificate for your domain (in us-east-1)
- Route53 hosted zone for your domain

### 2. Configure Environment

Edit `.env`:

```bash
GLEAN_API_TOKEN=your_token_here
GLEAN_INSTANCE=your-instance
GLEAN_AGENT_ID=your_agent_id
AWS_PROFILE=your-aws-profile
AWS_REGION=us-east-1
CUSTOM_DOMAIN=your-domain.com
```

### 3. Deploy CloudFormation Stack

```bash
cd cloudformation
./deploy.sh
```

This will:
- Create S3 bucket with encryption
- Create CloudFront distribution with WAF
- Deploy Lambda proxy function
- Create API Gateway endpoint
- Upload add-in files to S3
- Create CloudFront cache invalidation

**Deployment time**: ~15-20 minutes (CloudFront distribution creation)

### 4. Configure DNS

After deployment, create a CNAME record in Route53:

```
Name: your-domain.com
Type: CNAME
Value: <CloudFront-Domain-from-output>
TTL: 300
```

**DNS propagation**: 5-10 minutes

### 5. Update Manifest

Update `word-addin/manifest.xml` with your production domain:

```xml
<SourceLocation DefaultValue="https://your-domain.com/taskpane.html"/>
```

### 6. Upload to Word

**Word Desktop**:
1. Insert → Get Add-ins → My Add-ins → Upload My Add-in

   ![Upload My Add-in](images/upload-my-addin-office-setting-screenshot.png)

2. Select and upload updated `manifest.xml`

   ![Select Manifest](images/upload-addin-with-manifestxml-included.png)

**Word Online**:
1. Insert → Office Add-ins → Upload My Add-in
2. Upload `manifest.xml`

### 7. Test Production

1. Open add-in in Word
2. Configure credentials
3. Test with sample contract
4. Verify changes are applied

## Deployment Validation

### Test Checklist

- [ ] Add-in loads in Word
- [ ] Configuration saves successfully
- [ ] API connection works
- [ ] Contract analysis completes
- [ ] Tracked changes are applied
- [ ] Error handling works
- [ ] HTTPS is enforced
- [ ] WAF is blocking malicious requests

### Validation Script

```bash
cd cloudformation
./validate.sh
```

This checks:
- CloudFormation stack status
- S3 bucket accessibility
- CloudFront distribution
- API Gateway endpoint
- Lambda function

## Updating the Deployment

### Update Code

1. Make changes to files in `word-addin/`
2. Test locally with `npm run serve-https`
3. Deploy to AWS:

```bash
cd cloudformation
./deploy.sh
```

The deploy script will:
- Upload new files to S3
- Invalidate CloudFront cache
- Update Lambda if needed

### Update Manifest

If you change the manifest:

1. Update `word-addin/manifest.xml`
2. Re-upload to Word
3. Restart Word to load new manifest

### Update Infrastructure

If you change CloudFormation template:

```bash
cd cloudformation
./deploy.sh
```

CloudFormation will update only changed resources.

## Troubleshooting

### Local Development Issues

**"localhost refused to connect"**
- Ensure `npm run serve-https` is running
- Check port 3000 is not in use: `lsof -i :3000`

**"Certificate not trusted"**
- Follow certificate trust steps above
- Clear Word cache: `rm -rf ~/Library/Containers/com.microsoft.Word/Data/Documents/wef`

**"Add-in won't load"**
- Check browser console in task pane (F12)
- Verify manifest.xml is valid
- Ensure all URLs use HTTPS

### AWS Deployment Issues

**CloudFormation stack failed**
- Check CloudFormation events in AWS Console
- Verify IAM permissions
- Ensure ACM certificate exists in us-east-1

**DNS not resolving**
- Wait 5-10 minutes for propagation
- Test with: `nslookup your-domain.com`
- Verify CNAME record in Route53

**Files not updating**
- Run `./deploy.sh` to invalidate cache
- Wait for invalidation to complete (~5 minutes)
- Check S3 bucket contents

**WAF blocking requests**
- Check WAF logs in CloudWatch
- Adjust rate limits if needed
- Review IP-based rules

**Lambda timeout**
- Increase timeout in CloudFormation template
- Check Glean API response time
- Review CloudWatch logs

### Add-in Issues

**Configuration not saving**
- Check browser console for errors
- Verify localStorage is enabled
- Try incognito/private mode

**Changes not applied**
- Verify `searchText` matches document exactly
- Check track changes is enabled
- Review results section for errors

**API errors**
- Verify API token is valid
- Check instance name (no `-be.glean.com`)
- Ensure agent ID is correct
- Test with `test-api.ts`

## Monitoring

### CloudWatch Dashboards

Create a dashboard with:
- Lambda invocations and errors
- API Gateway requests and latency
- CloudFront cache hit ratio
- WAF blocked requests

### CloudWatch Alarms

Recommended alarms:
- Lambda error rate > 5%
- API Gateway 5xx errors > 10
- Lambda duration > 4 minutes
- WAF block rate > 50%

### Logs

View logs:

```bash
# Lambda logs
aws logs tail /aws/lambda/word-addin-glean-proxy --follow

# API Gateway logs
aws logs tail /aws/apigateway/word-addin-api --follow
```

## Security Considerations

### Production Checklist

- [ ] API tokens in environment variables (not code)
- [ ] `.env` file in `.gitignore`
- [ ] WAF enabled with managed rules
- [ ] HTTPS enforced (TLS 1.2+)
- [ ] S3 bucket public access blocked
- [ ] CloudWatch logging enabled
- [ ] IAM roles follow least privilege
- [ ] Regular security audits scheduled

### Token Rotation

Rotate Glean API tokens every 90 days:

1. Create new token in Glean admin console
2. Update `.env` file
3. Redeploy: `cd cloudformation && ./deploy.sh`
4. Update Word add-in configuration
5. Revoke old token

## Cost Management

### Monitor Costs

- Set up AWS Budget alerts
- Review Cost Explorer monthly
- Monitor CloudWatch metrics

### Optimize Costs

- Enable CloudFront caching
- Set CloudWatch log retention to 7 days
- Use Lambda reserved concurrency
- Delete old CloudFormation stacks

## Rollback Procedure

If deployment fails:

### Rollback CloudFormation

```bash
aws cloudformation cancel-update-stack --stack-name word-addin-hosting
```

### Restore Previous Version

```bash
# Restore from S3 versioning
aws s3api list-object-versions --bucket your-bucket --prefix taskpane.js
aws s3api get-object --bucket your-bucket --key taskpane.js --version-id <VERSION_ID> taskpane.js
```

### Revert DNS

Update Route53 CNAME to previous CloudFront distribution.

## Support

For deployment issues:

1. Check troubleshooting section above
2. Review CloudFormation events
3. Check CloudWatch logs
4. Open GitHub issue
5. Email support@glean.com

## Next Steps

After successful deployment:

- [ ] Configure monitoring and alarms
- [ ] Set up automated backups
- [ ] Document custom configurations
- [ ] Train users on the add-in
- [ ] Plan for regular updates
