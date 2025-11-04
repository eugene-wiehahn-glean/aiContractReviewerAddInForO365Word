# Quick Start Guide

## Get Running in 5 Minutes

### 1. Install Dependencies
```bash
cd word-addin
npm install
```

### 2. Create Icon Files

You need to create 4 icon files in the `assets` folder. For quick testing, you can use any PNG images:

```bash
# Create placeholder icons (you'll want to replace these with real icons)
mkdir -p assets
# Copy any small PNG file 4 times with these names:
# - assets/icon-16.png
# - assets/icon-32.png
# - assets/icon-64.png
# - assets/icon-80.png
```

Or use an online tool like [favicon.io](https://favicon.io/) to generate icons from text/emoji.

### 3. Start the Server
```bash
npm run serve
```

The server will start on `http://localhost:3000`.

### 4. Sideload in Word

**Option A: Word Desktop**
1. Open Microsoft Word
2. Go to **Insert** → **Get Add-ins** → **My Add-ins**
3. Click **Upload My Add-in**

   ![Upload My Add-in](../docs/images/upload-my-addin-office-setting-screenshot.png)

4. Select `manifest.xml` from the word-addin folder

   ![Select Manifest](../docs/images/upload-addin-with-manifestxml-included.png)

5. Click **Upload**

**Option B: Word Online**
1. Go to [office.com](https://office.com) and open Word
2. Create or open a document
3. Go to **Insert** → **Office Add-ins**
4. Click **Upload My Add-in**
5. Upload the `manifest.xml` file

### 5. Configure the Add-in

1. In Word, click the **AI Contract Reviewer** button in the Home ribbon
2. A task pane will open on the right
3. Enter your Glean credentials:
   - **API Token**: Get from [Glean Admin Console](https://app.glean.com/admin/platform/tokenManagement)
   - **Instance**: Your Glean instance name (e.g., `your-company`)
   - **Agent ID**: Your contract review agent ID

   ![Configuration Panel](../docs/images/ai-contract-reviewing-addin-config-expanded.png)

4. Click **Save Configuration**
5. The status should change to "Configured" (green)

### 6. Test It!

1. Paste a sample contract into your Word document (or use the dummy contract from the test file)
2. Click **Analyze Document** in the task pane
3. Wait 1-2 minutes for the analysis
4. Review the tracked changes applied to your document!

## Troubleshooting

**Add-in doesn't appear in Word**
- Make sure the server is running (`npm run serve`)
- Try refreshing Word or restarting it
- Check that manifest.xml is valid

**"Not Configured" status**
- Make sure all three fields are filled in
- Click "Save Configuration"
- Check browser console (F12) for errors

**No changes applied**
- Check the Results section for error messages
- Verify your Glean agent is configured correctly
- Make sure the document has content

**CORS errors**
- The http-server should handle CORS automatically
- If issues persist, try using `--cors` flag explicitly

## Next Steps

- Configure your Glean agent with the instructions from the main README
- Test with real contracts
- Customize the UI styling in `taskpane.html`
- Add your company branding and icons
- Deploy to production hosting

## Need Help?

Check the full README.md for detailed documentation and troubleshooting.
