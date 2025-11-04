# AI Contract Reviewer - Word Add-in

A Microsoft Word Add-in that integrates with Glean AI to provide automated legal document redlining with tracked changes.

## Features

- 🔐 **Secure Configuration**: Store your Glean API credentials securely in browser storage
- 🤖 **AI-Powered Analysis**: Leverage Glean's AI agent to analyze contracts against your standard MSA
- ✏️ **Tracked Changes**: All modifications are applied with Word's track changes enabled
- 📊 **Clear Feedback**: Visual indicators for configuration status, loading states, and results
- 🎨 **Modern UI**: Clean, professional interface following Office design guidelines

## Prerequisites

1. **Microsoft Word**: Word 2016 or later (Windows/Mac) or Word Online
2. **Glean Account**: Active Glean account with API access
3. **Glean Agent**: Configured legal redlining agent with the following inputs:
   - `Customer Contract Text (Provided by Word Add-In)`
   - `Link to our standard MSA`

## Setup Instructions

### 1. Install Dependencies

```bash
cd word-addin
npm install
```

### 2. Create Icon Files

Create placeholder icon files in the `assets` folder:
- `icon-16.png` (16x16 pixels)
- `icon-32.png` (32x32 pixels)
- `icon-64.png` (64x64 pixels)
- `icon-80.png` (80x80 pixels)

You can use any image editor or online tool to create simple icons with your company logo or the ⚖️ emoji.

### 3. Start the Development Server

```bash
npm run serve
```

This will start a local web server on `https://localhost:3000`.

### 4. Sideload the Add-in

#### For Word Desktop (Windows/Mac):

1. Open Word
2. Go to **Insert** > **Get Add-ins** > **My Add-ins**
3. Click **Upload My Add-in**

   ![Upload My Add-in](../docs/images/upload-my-addin-office-setting-screenshot.png)

4. Browse to `manifest.xml` and upload it

   ![Select Manifest](../docs/images/upload-addin-with-manifestxml-included.png)

#### For Word Online:

1. Open Word Online
2. Go to **Insert** > **Office Add-ins**
3. Click **Upload My Add-in**
4. Upload the `manifest.xml` file

### 5. Configure the Add-in

1. Click the **AI Contract Reviewer** button in the Home ribbon
2. Enter your configuration:
   - **Glean API Token**: Get from [Glean Admin Console](https://app.glean.com/admin/platform/tokenManagement)
   - **Glean Instance**: Your instance name (e.g., `your-company`)
   - **Agent ID**: Your contract review agent ID

   ![Configuration Panel](../docs/images/ai-contract-reviewing-addin-config-expanded.png)

3. Click **Save Configuration**

## Usage

### Analyzing a Document

1. Open a contract document in Word
2. Open the Glean Legal Redlining task pane
3. Ensure your configuration is saved (green "Configured" badge)
4. Click **Analyze Document**
5. Wait for the AI analysis (1-2 minutes)
6. Review the tracked changes applied to your document

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

## Glean Agent Configuration

Your Glean agent should be configured to return JSON in the following format:

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

### Agent Instructions

See the main project README for detailed instructions on configuring your Glean agent's "Think" and "Respond" steps.

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

## Development

### Project Structure

```
word-addin/
├── manifest.xml          # Add-in manifest
├── taskpane.html         # Main UI
├── commands.html         # Function commands
├── src/
│   └── taskpane.js      # Main logic
├── assets/              # Icons
└── package.json         # Dependencies
```

### Key Files

- **manifest.xml**: Defines the add-in metadata and configuration
- **taskpane.html**: Contains the UI layout and styling
- **taskpane.js**: Implements all functionality including:
  - Configuration management
  - Glean API integration
  - Word document manipulation
  - Track changes application
  - Results display

### Testing

1. Make changes to the code
2. Refresh the task pane in Word (close and reopen)
3. Test with sample contracts
4. Check browser console for errors

## Security Considerations

- API tokens are stored in browser localStorage (not secure for production)
- For production use, implement proper authentication and token management
- Consider using Azure AD or OAuth for enterprise deployments
- Never commit API tokens to version control

## Production Deployment

For production deployment:

1. Replace `localhost:3000` URLs in manifest.xml with your production URL
2. Host the add-in files on a secure HTTPS server
3. Update the manifest ID to a unique GUID
4. Implement proper authentication
5. Add error tracking and analytics
6. Create proper icon assets
7. Submit to AppSource or deploy via centralized deployment

## Support

For issues or questions:
- Check the troubleshooting section above
- Review browser console for errors
- Contact your Glean administrator
- Review Glean API documentation

## License

MIT License - See LICENSE file for details
