function syncCorpAILeads() {
  var spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = spreadsheet.getSheetByName('CorpAI Leads') || spreadsheet.getSheets()[0];
  if (!sheet) {
    throw new Error('No sheet found in active spreadsheet.');
  }
  sheet.setName('CorpAI Leads');

  var properties = PropertiesService.getScriptProperties();
  var endpoint = properties.getProperty('CORPAI_LEADS_ENDPOINT') || 'https://corpai-intake-service.arimail-57e.workers.dev/leads?limit=100';
  var token = properties.getProperty('CORPAI_ADMIN_READ_TOKEN');
  if (!token) {
    throw new Error('Missing script property CORPAI_ADMIN_READ_TOKEN.');
  }
  var headers = [
    'id',
    'created_at',
    'name',
    'email',
    'company',
    'team_size',
    'current_tools',
    'target_workflow',
    'monthly_volume',
    'biggest_pain',
    'timeline',
    'source',
    'status',
    'owner',
    'next_step',
    'notes',
  ];

  var response = UrlFetchApp.fetch(endpoint, {
    method: 'get',
    headers: {
      Authorization: 'Bearer ' + token,
    },
    muteHttpExceptions: true,
  });

  var status = response.getResponseCode();
  if (status !== 200) {
    throw new Error('Lead sync failed with status ' + status + ': ' + response.getContentText());
  }

  var payload = JSON.parse(response.getContentText());
  var sourceRows = payload.leads || payload.rows || [];
  var rows = sourceRows.map(function(row) {
    return headers.map(function(header) {
      var value = row[header];
      return value === null || value === undefined ? '' : value;
    });
  });

  if (sheet.getMaxRows() > 1) {
    sheet.getRange(2, 1, sheet.getMaxRows() - 1, headers.length).clearContent();
  }

  if (rows.length > 0) {
    sheet.getRange(2, 1, rows.length, headers.length).setValues(rows);
  }
}

function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu('CorpAI')
    .addItem('Sync Leads', 'syncCorpAILeads')
    .addToUi();
}
