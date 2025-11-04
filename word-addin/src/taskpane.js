/* global Office, Word */

// Initialize when DOM is ready
if (typeof Office !== 'undefined') {
  Office.onReady((info) => {
    if (info.host === Office.HostType.Word) {
      initializeApp();
    }
  });
} else {
  // For browser preview (non-Office environment)
  document.addEventListener('DOMContentLoaded', initializeApp);
}

function initializeApp() {
  // Load saved configuration
  loadConfiguration();
  
  // Set up event listeners
  document.getElementById('saveConfig').addEventListener('click', saveConfiguration);
  document.getElementById('analyzeBtn').addEventListener('click', analyzeDocument);
  document.getElementById('configHeader').addEventListener('click', toggleConfigSection);
  
  // Start with config section collapsed
  const content = document.getElementById('configContent');
  const icon = document.getElementById('collapseIcon');
  content.classList.add('collapsed');
  icon.classList.add('collapsed');
  
  // Check if config exists and enable analyze button
  updateUIState();
}

// Toggle Configuration Section
function toggleConfigSection() {
  const content = document.getElementById('configContent');
  const icon = document.getElementById('collapseIcon');
  
  content.classList.toggle('collapsed');
  icon.classList.toggle('collapsed');
}

// Configuration Management
function loadConfiguration() {
  const config = {
    apiToken: localStorage.getItem('glean_api_token') || '',
    instance: localStorage.getItem('glean_instance') || '',
    agentId: localStorage.getItem('glean_agent_id') || ''
  };
  
  document.getElementById('apiToken').value = config.apiToken;
  document.getElementById('instance').value = config.instance;
  document.getElementById('agentId').value = config.agentId;
  
  return config;
}

function saveConfiguration() {
  const apiToken = document.getElementById('apiToken').value.trim();
  const instance = document.getElementById('instance').value.trim();
  const agentId = document.getElementById('agentId').value.trim();
  
  if (!apiToken || !instance || !agentId) {
    showStatus('Please fill in all configuration fields', 'error');
    return;
  }
  
  localStorage.setItem('glean_api_token', apiToken);
  localStorage.setItem('glean_instance', instance);
  localStorage.setItem('glean_agent_id', agentId);
  
  showStatus('Configuration saved successfully!', 'success');
  updateUIState();
}

function updateUIState() {
  const config = loadConfiguration();
  const isConfigured = config.apiToken && config.instance && config.agentId;
  
  const configStatus = document.getElementById('configStatus');
  const analyzeBtn = document.getElementById('analyzeBtn');
  
  if (isConfigured) {
    configStatus.textContent = 'Configured';
    configStatus.className = 'config-status configured';
    analyzeBtn.disabled = false;
  } else {
    configStatus.textContent = 'Not Configured';
    configStatus.className = 'config-status not-configured';
    analyzeBtn.disabled = true;
  }
}

// Status Messages
function showStatus(message, type = 'info') {
  const statusEl = document.getElementById('statusMessage');
  statusEl.textContent = message;
  statusEl.className = `status-message status-${type} show`;
  
  // Auto-hide after 5 seconds for success messages
  if (type === 'success') {
    setTimeout(() => {
      statusEl.classList.remove('show');
    }, 5000);
  }
}

function hideStatus() {
  const statusEl = document.getElementById('statusMessage');
  statusEl.classList.remove('show');
}

// Loading Overlay
function showLoading(text = 'Analyzing your document...', subtext = 'This may take 1-2 minutes') {
  const overlay = document.getElementById('loadingOverlay');
  overlay.querySelector('.loading-text').textContent = text;
  overlay.querySelector('.loading-subtext').textContent = subtext;
  overlay.classList.add('show');
}

function hideLoading() {
  document.getElementById('loadingOverlay').classList.remove('show');
}

// Main Analysis Function
async function analyzeDocument() {
  hideStatus();
  showLoading();
  
  try {
    // Step 1: Get document text
    showLoading('Reading document...', 'Extracting contract text');
    const documentText = await getDocumentText();
    
    if (!documentText || documentText.trim().length === 0) {
      throw new Error('Document is empty. Please add content to your document.');
    }
    
    // Step 2: Call Glean API
    showLoading('Analyzing with Glean AI...', 'This may take 1-2 minutes');
    const changes = await callGleanAPI(documentText);
    
    if (!changes || changes.length === 0) {
      showStatus('No changes recommended by the AI agent', 'info');
      hideLoading();
      return;
    }
    
    // Step 3: Enable track changes
    showLoading('Preparing to apply changes...', 'Enabling track changes');
    await enableTrackChanges();
    
    // Step 4: Apply changes
    showLoading('Applying changes...', `Processing ${changes.length} changes`);
    const results = await applyChanges(changes);
    
    // Step 5: Show results
    hideLoading();
    displayResults(results);
    
    const successCount = results.filter(r => r.success).length;
    const failCount = results.filter(r => !r.success).length;
    
    showStatus(
      `Applied ${successCount} of ${changes.length} changes successfully${failCount > 0 ? ` (${failCount} failed)` : ''}`,
      failCount > 0 ? 'warning' : 'success'
    );
    
  } catch (error) {
    hideLoading();
    console.error('Error analyzing document:', error);
    showStatus(`Error: ${error.message}`, 'error');
  }
}

// Get Document Text
async function getDocumentText() {
  return Word.run(async (context) => {
    const body = context.document.body;
    body.load('text');
    await context.sync();
    return body.text;
  });
}

// Enable Track Changes
async function enableTrackChanges() {
  return Word.run(async (context) => {
    context.document.changeTrackingMode = Word.ChangeTrackingMode.trackAll;
    await context.sync();
  });
}

// Call Glean API via Lambda Proxy
async function callGleanAPI(documentText) {
  const config = loadConfiguration();
  
  // Use API Gateway endpoint (will be set via environment or config)
  const apiUrl = 'https://o8d9szre4m.execute-api.us-east-1.amazonaws.com/prod/analyze';
  
  const requestBody = {
    apiToken: config.apiToken,
    instance: config.instance,
    agentId: config.agentId,
    documentText: documentText,
    msaLink: "https://docs.google.com/document/d/1jaLeyhnrNndtv3fWbm10kj01PvwKB-qStt6dRETuBA4/edit?tab=t.0"
  };
  
  console.log('Calling Glean proxy API:', apiUrl);
  console.log('Request body (token hidden):', { ...requestBody, apiToken: '***' });
  
  let response;
  try {
    response = await fetch(apiUrl, {
      method: 'POST',
      mode: 'cors',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody)
    });
  } catch (fetchError) {
    console.error('Fetch error:', fetchError);
    throw new Error(`Network error: ${fetchError.message}. Check browser console for details.`);
  }
  
  console.log('Response status:', response.status);
  
  if (!response.ok) {
    const errorText = await response.text();
    console.error('API error response:', errorText);
    throw new Error(`Proxy API error (${response.status}): ${errorText}`);
  }
  
  const result = await response.json();
  
  // Extract text from response
  let responseText = '';
  if (result.messages && result.messages.length > 0) {
    const lastMessage = result.messages[result.messages.length - 1];
    if (lastMessage.role === 'GLEAN_AI' && lastMessage.content) {
      for (const content of lastMessage.content) {
        if (content.type === 'text') {
          responseText += content.text;
        }
      }
    }
  }
  
  if (!responseText) {
    throw new Error('No response from Glean agent');
  }
  
  // Parse JSON from response
  let jsonData;
  try {
    // Try to parse as direct JSON
    jsonData = JSON.parse(responseText);
  } catch (e) {
    // Try to extract JSON from markdown code blocks
    const jsonMatch = responseText.match(/```json\s*([\s\S]*?)\s*```/);
    if (jsonMatch) {
      jsonData = JSON.parse(jsonMatch[1]);
    } else {
      // Try to find JSON object in text
      const jsonObjectMatch = responseText.match(/\{[\s\S]*"changes"[\s\S]*\}/);
      if (jsonObjectMatch) {
        jsonData = JSON.parse(jsonObjectMatch[0]);
      } else {
        throw new Error('Could not parse JSON from agent response');
      }
    }
  }
  
  if (!jsonData.changes || !Array.isArray(jsonData.changes)) {
    throw new Error('Invalid response format: missing changes array');
  }
  
  return jsonData.changes;
}

// Apply Changes to Document
async function applyChanges(changes) {
  const results = [];
  
  for (const change of changes) {
    try {
      const result = await applyChange(change);
      results.push({
        ...change,
        success: result.success,
        error: result.error
      });
    } catch (error) {
      results.push({
        ...change,
        success: false,
        error: error.message
      });
    }
  }
  
  return results;
}

// Apply Single Change
async function applyChange(change) {
  return Word.run(async (context) => {
    try {
      switch (change.type) {
        case 'replace':
          return await applyReplace(context, change);
        case 'insert':
          return await applyInsert(context, change);
        case 'delete':
          return await applyDelete(context, change);
        case 'insertClause':
          return await applyInsertClause(context, change);
        default:
          return { success: false, error: `Unknown change type: ${change.type}` };
      }
    } catch (error) {
      return { success: false, error: error.message };
    }
  });
}

// Apply Replace Change
async function applyReplace(context, change) {
  const searchResults = context.document.body.search(change.searchText, { matchCase: false, matchWholeWord: false });
  searchResults.load('items');
  await context.sync();
  
  if (searchResults.items.length === 0) {
    return { success: false, error: 'Text not found in document' };
  }
  
  // Replace the first occurrence
  const range = searchResults.items[0];
  range.insertText(change.replaceWith, Word.InsertLocation.replace);
  await context.sync();
  
  return { success: true };
}

// Apply Insert Change
async function applyInsert(context, change) {
  const searchResults = context.document.body.search(change.afterText, { matchCase: false, matchWholeWord: false });
  searchResults.load('items');
  await context.sync();
  
  if (searchResults.items.length === 0) {
    return { success: false, error: 'Anchor text not found in document' };
  }
  
  const range = searchResults.items[0];
  range.insertText(' ' + change.insertText, Word.InsertLocation.after);
  await context.sync();
  
  return { success: true };
}

// Apply Delete Change
async function applyDelete(context, change) {
  const searchResults = context.document.body.search(change.searchText, { matchCase: false, matchWholeWord: false });
  searchResults.load('items');
  await context.sync();
  
  if (searchResults.items.length === 0) {
    return { success: false, error: 'Text not found in document' };
  }
  
  const range = searchResults.items[0];
  range.delete();
  await context.sync();
  
  return { success: true };
}

// Apply Insert Clause Change
async function applyInsertClause(context, change) {
  const searchResults = context.document.body.search(change.afterSection, { matchCase: false, matchWholeWord: false });
  searchResults.load('items');
  await context.sync();
  
  if (searchResults.items.length === 0) {
    return { success: false, error: 'Section not found in document' };
  }
  
  const range = searchResults.items[0];
  range.insertText('\n\n' + change.clauseContent, Word.InsertLocation.after);
  await context.sync();
  
  return { success: true };
}

// Format change ID for better display
function formatChangeId(id) {
  if (!id) return '';
  
  // Convert "change_1" to "Change #1"
  if (id.startsWith('change_')) {
    const number = id.replace('change_', '');
    return `Change #${number}`;
  }
  
  // Convert underscores to spaces and capitalize
  return id.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
}

// Display Results
function displayResults(results) {
  const resultsSection = document.getElementById('resultsSection');
  const resultsContent = document.getElementById('resultsContent');
  
  resultsContent.innerHTML = '';
  
  results.forEach((result, index) => {
    const resultItem = document.createElement('div');
    resultItem.className = `result-item ${result.success ? 'success' : 'error'}`;
    
    const typeEl = document.createElement('div');
    typeEl.className = 'result-type';
    
    // Format the change ID nicely
    const changeId = formatChangeId(result.id) || `Change #${index + 1}`;
    const changeBadge = document.createElement('span');
    changeBadge.className = 'change-badge';
    changeBadge.textContent = changeId;
    
    typeEl.innerHTML = `${result.success ? '✓' : '✗'} ${result.type.toUpperCase()}`;
    typeEl.appendChild(changeBadge);
    
    const reasonEl = document.createElement('div');
    reasonEl.className = 'result-reason';
    reasonEl.textContent = result.success ? result.reason : `Failed: ${result.error}`;
    
    resultItem.appendChild(typeEl);
    resultItem.appendChild(reasonEl);
    resultsContent.appendChild(resultItem);
  });
  
  resultsSection.classList.add('show');
}
