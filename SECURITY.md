# Security Policy

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| 1.x.x   | :white_check_mark: |

## Reporting a Vulnerability

If you discover a security vulnerability, please email **security@glean.com** with:

1. Description of the vulnerability
2. Steps to reproduce
3. Potential impact
4. Suggested fix (if any)

**Do not** open a public GitHub issue for security vulnerabilities.

We will respond within 48 hours and provide a timeline for fixes.

## Security Best Practices

When using this add-in:

1. **Never commit** `.env` files or API tokens to version control
2. **Use environment variables** for all sensitive data
3. **Enable WAF** in production deployments
4. **Rotate API tokens** regularly (at least every 90 days)
5. **Review CloudWatch logs** for suspicious activity
6. **Keep dependencies updated** with `npm audit`
7. **Use HTTPS** for all deployments
8. **Implement rate limiting** on API endpoints

## Secure Deployment Checklist

### Before Deployment

- [ ] API tokens stored in environment variables (not hardcoded)
- [ ] `.env` file added to `.gitignore`
- [ ] All secrets removed from code
- [ ] Dependencies audited with `npm audit`
- [ ] CloudFormation template reviewed

### AWS Infrastructure

- [ ] AWS WAF enabled with managed rules
- [ ] HTTPS enforced (TLS 1.2+)
- [ ] CloudFront security headers configured
- [ ] S3 bucket public access blocked
- [ ] Origin Access Control (OAC) configured
- [ ] CloudWatch logging enabled
- [ ] IAM roles follow least privilege principle

### Word Add-in

- [ ] API tokens stored in browser localStorage only (not in code)
- [ ] CORS properly configured
- [ ] Input validation on all user inputs
- [ ] Error messages don't expose sensitive information
- [ ] Manifest uses HTTPS URLs only

### Ongoing Security

- [ ] Regular security audits scheduled
- [ ] Dependency updates automated (Dependabot)
- [ ] CloudWatch alarms configured for anomalies
- [ ] API token rotation policy in place
- [ ] Incident response plan documented

## Known Security Considerations

### Browser Storage

The add-in stores Glean API tokens in browser `localStorage`. This is acceptable for:
- Development and testing
- Single-user deployments
- Trusted environments

For enterprise production use, consider:
- Implementing OAuth 2.0 flow
- Using Azure AD authentication
- Server-side token management
- Token encryption at rest

### Lambda Proxy

The Lambda function acts as a proxy to:
- Handle CORS for browser-based requests
- Centralize API token management
- Add rate limiting and monitoring

Ensure:
- Lambda has minimal IAM permissions
- CloudWatch logs are monitored
- API Gateway has throttling enabled

### Contract Data

Contract text is sent to:
1. AWS Lambda (logged in CloudWatch)
2. Glean API (processed and stored per Glean's policies)

Ensure:
- CloudWatch log retention is appropriate
- Glean's data handling meets your compliance requirements
- Sensitive contracts are reviewed before using the add-in

## Compliance

This add-in processes legal documents. Ensure compliance with:
- **GDPR**: If processing EU personal data
- **CCPA**: If processing California resident data
- **HIPAA**: If processing healthcare information
- **SOC 2**: For enterprise deployments
- **Industry-specific regulations**: Legal, financial, healthcare

## Security Updates

Security updates will be:
- Released as soon as possible after discovery
- Announced in GitHub releases
- Tagged with `security` label
- Documented in CHANGELOG.md

Subscribe to repository notifications to stay informed.

## Contact

For security concerns:
- Email: security@glean.com
- Do not use public channels for sensitive security issues
