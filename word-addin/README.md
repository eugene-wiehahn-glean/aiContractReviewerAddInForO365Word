# Developer Documentation - Word Add-in

> **📘 Note:** This is developer documentation for understanding and modifying the add-in code. 
> 
> **Looking to install and use the add-in?** See the [main README](../README.md) for setup instructions.

---

This document provides technical details about the Word Add-in implementation for developers who want to understand or modify the code.

## Overview

The AI Contract Reviewer is a Microsoft Word Add-in built with vanilla JavaScript that integrates with Glean AI to provide automated legal document redlining with tracked changes.

### Key Features

- 🔐 **Secure Configuration**: Credentials stored in browser localStorage
- 🤖 **AI-Powered Analysis**: Integration with Glean's agent API
- ✏️ **Tracked Changes**: All modifications applied via Word's track changes API
- 📊 **Clear Feedback**: Visual status indicators and detailed results
- 🎨 **Modern UI**: Clean interface following Office design guidelines

### Technical Stack

- **Frontend**: Vanilla JavaScript (ES6+), HTML5, CSS3
- **Office API**: Office.js for Word integration
- **Backend**: AWS Lambda proxy for Glean API calls
- **Deployment**: S3 + CloudFront + WAF

## How It Works

### User Flow

1. User opens the add-in task pane in Word
2. User configures Glean credentials (stored in localStorage)
3. User clicks "Analyze Document"
4. Add-in extracts full document text
5. Add-in calls Lambda proxy with document text
6. Lambda proxy forwards request to Glean API
7. Glean agent analyzes contract and returns changes
8. Add-in applies changes as tracked changes in Word
9. Results displayed in task pane

### Understanding the Results

The add-in will display a summary of all changes:
- ✓ **Success**: Change was applied successfully
- ✗ **Failed**: Change could not be applied (text not found)

Each result shows:
- **Change Type**: replace, insert, delete, or insertClause
- **Reason**: Why the change was recommended
- **Status**: Success or error message

### Change Types

The add-in supports four types of changes:

1. **Replace**: Replace existing text with new text
2. **Insert**: Add new text after a specific anchor point
3. **Delete**: Remove specific text from the document
4. **Insert Clause**: Add a new section or clause after a specified section

## Configuration Panel

The add-in includes a configuration panel where users enter their Glean credentials:

![Configuration Panel](../docs/images/ai-contract-reviewing-addin-config-expanded.png)

Credentials are stored in browser localStorage:
```javascript
localStorage.setItem('gleanApiToken', token);
localStorage.setItem('gleanInstance', instance);
localStorage.setItem('gleanAgentId', agentId);
```

**Security Note:** localStorage is not secure for production. Consider implementing proper authentication for enterprise deployments.

## Glean Agent Configuration

Your Glean agent must be configured to return JSON in the following format:

```json
{
  "changes": [
    {
      "id": "change_1",
      "type": "replace",
      "searchText": "exact text to find",
      "replaceWith": "new text",
      "reason": "Explanation",
      "category": "legal_protection"
    }
  ],
  "summary": "Overview of changes"
}
```

### Required Agent Inputs

The agent must accept these inputs:
1. `Customer Contract Text (Provided by Word Add-In)` - Full document text
2. `Link to our standard MSA` - URL to standard contract

### Agent Response Format

The agent must return valid JSON with:
- `changes` array with change objects
- Each change must have: `id`, `type`, `searchText` (or `afterText`), `reason`
- Optional: `summary` field for overall analysis

See the main project README for detailed agent configuration instructions.

## Troubleshooting

### Configuration Not Saving
- Check browser console for errors
- Ensure localStorage is enabled in your browser
- Try clearing browser cache and reconfiguring

### Changes Not Applied
- Verify the searchText in the agent response matches your document exactly
- Check that track changes is enabled in Word
- Review the results section for specific error messages

### API Errors
- Verify your API token is correct and not expired
- Check that your instance name is correct (without `-be.glean.com`)
- Ensure your agent ID is valid
- Check network connectivity to Glean servers

### Slow Performance
- The Glean agent needs to fetch and analyze the standard MSA document
- Typical analysis takes 1-2 minutes
- Ensure stable internet connection

## Architecture & Code Structure

### Project Structure

```
word-addin/
├── manifest.xml          # Add-in manifest (Office configuration)
├── taskpane.html         # Main UI (task pane interface)
├── commands.html         # Function commands (ribbon button handlers)
├── src/
│   └── taskpane.js      # Main application logic
├── assets/              # Icons and static assets
│   ├── icon-*.png       # Required Office add-in icons
│   └── *.txt            # Sample contracts for testing
└── package.json         # Dependencies (office-addin-debugging, http-server)
```

### Key Files

#### manifest.xml
Defines the add-in metadata and configuration:
- Add-in ID, name, description
- Ribbon button configuration
- Task pane settings
- Required Office.js API sets
- Source locations (URLs to HTML files)

#### taskpane.html
Contains the UI layout and styling:
- Configuration form (API token, instance, agent ID)
- Analyze button
- Results display area
- Status indicators
- Inline CSS using Office UI Fabric styles

#### src/taskpane.js
Implements all functionality:
- **Configuration Management**: Save/load credentials from localStorage
- **Glean API Integration**: Call Lambda proxy with document text
- **Word Document Manipulation**: Extract text, apply tracked changes
- **Change Application Logic**: Handle replace, insert, delete, insertClause
- **Results Display**: Show success/failure for each change
- **Error Handling**: Graceful degradation and user feedback

### Development Workflow

1. **Make Code Changes**: Edit HTML, CSS, or JavaScript files
2. **Test Locally**: Refresh task pane in Word (close and reopen)
3. **Check Console**: Use browser dev tools (F12) for debugging
4. **Test with Samples**: Use contracts in `assets/` folder
5. **Deploy to AWS**: Run `cd ../cloudformation && ./deploy.sh`
6. **Test Production**: Upload manifest with production URL

## Security Considerations

### Current Implementation
- ⚠️ API tokens stored in browser localStorage (not secure for production)
- ⚠️ No authentication layer between add-in and Lambda proxy
- ✅ Lambda proxy handles CORS and API token management
- ✅ HTTPS required for all add-in hosting

### Production Recommendations
1. **Authentication**: Implement Azure AD or OAuth for enterprise deployments
2. **Token Management**: Use secure token storage (Azure Key Vault, AWS Secrets Manager)
3. **API Security**: Add authentication layer to Lambda proxy
4. **Audit Logging**: Track all API calls and document modifications
5. **Rate Limiting**: Implement per-user rate limits
6. **Data Privacy**: Ensure compliance with data residency requirements

### Best Practices
- Never commit API tokens to version control
- Use environment variables for configuration
- Implement proper error handling and logging
- Regular security audits of dependencies
- Monitor for suspicious activity

## Deployment

For deployment instructions, see:
- [Main README](../README.md) - Automated setup with `setup.sh`
- [Deployment Guide](../docs/deployment.md) - Detailed AWS deployment steps
- [CloudFormation README](../cloudformation/README.md) - Infrastructure details

## API Reference

### Office.js APIs Used

- `Word.run()` - Execute batch operations on Word document
- `context.document.body.getRange()` - Get document text
- `context.document.body.search()` - Find text in document
- `range.insertText()` - Insert text at location
- `range.delete()` - Remove text
- `range.trackChanges` - Enable tracked changes

### Lambda Proxy Endpoint

**Endpoint**: `https://your-api-gateway-url.execute-api.region.amazonaws.com/prod/glean-proxy`

**Request**:
```javascript
POST /glean-proxy
Content-Type: application/json

{
  "apiToken": "glean_api_token",
  "instance": "your-instance",
  "agentId": "agent_id",
  "documentText": "full contract text",
  "msaLink": "https://link-to-standard-msa"
}
```

**Response**:
```javascript
{
  "changes": [...],
  "summary": "..."
}
```

## Contributing

For contribution guidelines, see [CONTRIBUTING.md](../CONTRIBUTING.md)

## License

MIT License - See [LICENSE](../LICENSE) file for details
