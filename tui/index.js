const blessed = require('blessed');
const axios = require('axios');

// API Configuration
const BASE_URL = 'http://localhost:5000';

// Create a screen object.
const screen = blessed.screen({
  smartCSR: true,
  title: 'Docker TUI Manager'
});

// ─────────────────────────────────────────────────────────────────────────────
// Components
// ─────────────────────────────────────────────────────────────────────────────

// Header Title
const titleBox = blessed.box({
  top: 0,
  left: 0,
  width: '100%',
  height: 3,
  content: '{center}{bold}Docker TUI Manager{/bold}{/center}',
  tags: true,
  border: { type: 'line' },
  style: {
    border: { fg: 'cyan' },
    fg: 'white'
  }
});

// Filter / Search Input
const filterInput = blessed.textbox({
  top: 3,
  left: 0,
  width: '40%',
  height: 3,
  label: ' {bold}Filter (Esc to clear){/bold} ',
  border: { type: 'line' },
  style: {
    border: { fg: 'green' },
    focus: { border: { fg: 'yellow' } }
  },
  keys: true,
  mouse: true,
  inputOnFocus: true
});

// Left Panel: Container List
const list = blessed.list({
  top: 6, // Below title and filter
  left: 0,
  width: '40%',
  height: '100%-7',
  label: ' {bold}Containers{/bold} ',
  border: { type: 'line' },
  style: {
    item: { hover: { bg: 'blue' } },
    selected: { bg: 'blue', bold: true },
    border: { fg: '#f0f0f0' }
  },
  keys: true,
  vi: true,
  mouse: true,
  tags: true,
  items: ['Loading containers...']
});

// Right Panel Container (Details View)
const detailsBox = blessed.box({
  top: 3,
  right: 0,
  width: '60%',
  height: '100%-4',
  label: ' {bold}Details{/bold} ',
  border: { type: 'line' },
  content: '{center}Select a container and use actions{/center}',
  tags: true,
  style: {
    border: { fg: 'yellow' }
  }
});

// Logs Content
const logsView = blessed.box({
  parent: detailsBox,
  top: 0,
  left: 0,
  width: '100%-2',
  height: '100%-2',
  scrollable: true,
  alwaysScroll: true,
  keys: true,
  vi: true,
  mouse: true,
  scrollbar: {
    ch: ' ',
    track: { bg: 'cyan' },
    style: { inverse: true }
  },
  tags: true,
  hidden: true
});

// Stats Content
const statsView = blessed.box({
  parent: detailsBox,
  top: 'center',
  left: 'center',
  width: '90%',
  height: '80%',
  tags: true,
  hidden: true
});

// Confirmation Dialog
const confirmMsg = blessed.question({
  parent: screen,
  top: 'center',
  left: 'center',
  width: '40%',
  height: 'shrink',
  border: { type: 'line' },
  style: { border: { fg: 'red' }, bold: true },
  label: ' {bold}Confirm Action{/bold} ',
  hidden: true
});

// Footer / Status bar
const statusBar = blessed.box({
  bottom: 0,
  left: 0,
  width: '100%',
  height: 1,
  content: ' [/] Filter | [Enter] Stop | [r] Restart | [d] Delete | [l] Logs | [s] Stats | [q] Quit',
  style: { bg: 'blue', fg: 'white' }
});

// Append components to the screen.
screen.append(titleBox);
screen.append(filterInput);
screen.append(list);
screen.append(detailsBox);
screen.append(statusBar);

// ─────────────────────────────────────────────────────────────────────────────
// Logic & State
// ─────────────────────────────────────────────────────────────────────────────

let logInterval = null;
let currentSelectedId = null;
let filterQuery = '';
let allContainers = []; // Cache to allow local filtering

function setStatus(msg, isError = false) {
  statusBar.setContent(isError ? ` Error: ${msg}` : ` ${msg}`);
  statusBar.style.bg = isError ? 'red' : 'blue';
  screen.render();
}

function getSelectedId() {
  const item = list.getItem(list.selected);
  if (!item) return null;
  const content = item.getText();
  if (content.includes('|')) {
    const cleanContent = content.replace(/\{.*?\}/g, '');
    return cleanContent.split('|')[0].trim();
  }
  return null;
}

/**
 * Fetch containers and apply filtering
 */
async function fetchContainers() {
  try {
    const response = await axios.get(`${BASE_URL}/containers`);
    if (response.data && response.data.success) {
      allContainers = response.data.data;
      updateListView();
    }
  } catch (error) {
    list.setItems([`Error: ${error.message}`]);
  }
}

/**
 * Update the list view based on allContainers and filterQuery
 */
function updateListView() {
  const filtered = allContainers.filter(c => {
    const query = filterQuery.toLowerCase();
    return c.id.toLowerCase().includes(query) || 
           c.name.toLowerCase().includes(query) || 
           c.state.toLowerCase().includes(query);
  });

  const prevSelected = list.selected;
  
  const items = filtered.map(c => {
    const shortId = (c.id || '').substring(0, 12);
    const name = (c.name || 'N/A').padEnd(15);
    const state = (c.state || 'unknown');
    let stateColored = state === 'running' ? `{green-fg}${state}{/green-fg}` : `{red-fg}${state}{/red-fg}`;
    return `${shortId} | ${name} | ${stateColored}`;
  });
  
  if (items.length === 0) {
    list.setItems(['No containers match filter.']);
  } else {
    list.setItems(items);
    list.select(prevSelected);
  }
  screen.render();
}

/**
 * Fetch Logs with auto-refresh
 */
async function fetchLogs(id) {
  try {
    const response = await axios.get(`${BASE_URL}/containers/${id}/logs`);
    if (response.data && response.data.success) {
      const content = response.data.logs || 'No logs found.';
      logsView.setContent(content);
      if (!logsView.focused) logsView.setScrollPerc(100);
    }
  } catch (error) {
    logsView.setContent(`{red-fg}Error fetching logs: ${error.message}{/red-fg}`);
  }
  screen.render();
}

/**
 * Fetch and format Stats
 */
async function fetchStats(id) {
  try {
    const response = await axios.get(`${BASE_URL}/containers/${id}/stats`);
    if (response.data && response.data.success) {
      const { cpu_usage, memory_usage, memory_limit } = response.data.stats;
      const memMB = (memory_usage / 1024 / 1024).toFixed(2);
      const limitMB = (memory_limit / 1024 / 1024).toFixed(2);
      const memPercent = ((memory_usage / memory_limit) * 100).toFixed(2);

      statsView.setContent(`
{center}{yellow-fg}{bold}CONTAINER RESOURCE USAGE{/bold}{/yellow-fg}{/center}
{center}{bold}ID: ${id}{/bold}{/center}

{bold}CPU RAW USAGE:{/bold}   {green-fg}${cpu_usage}{/green-fg}
{bold}MEMORY USAGE:{/bold}    {green-fg}${memMB} MB{/green-fg}
{bold}MEMORY LIMIT:{/bold}    ${limitMB} MB
{bold}USAGE PERCENT:{/bold}   {cyan-fg}${memPercent}%{/cyan-fg}

{center}{blue-fg}Stats refresh with list update{/blue-fg}{/center}
      `);
    }
  } catch (error) {
    statsView.setContent(`{red-fg}Error fetching stats: ${error.message}{/red-fg}`);
  }
  screen.render();
}

function showLogs() {
  const id = getSelectedId();
  if (!id) return;
  stopLogInterval();
  currentSelectedId = id;
  detailsBox.setContent('');
  statsView.hide();
  logsView.show();
  detailsBox.setLabel(` {bold}Logs: ${id}{/bold} `);
  fetchLogs(id);
  logInterval = setInterval(() => fetchLogs(id), 2000);
  setStatus(`Viewing logs for ${id}`);
}

function showStats() {
  const id = getSelectedId();
  if (!id) return;
  stopLogInterval();
  currentSelectedId = id;
  detailsBox.setContent('');
  logsView.hide();
  statsView.show();
  detailsBox.setLabel(` {bold}Stats: ${id}{/bold} `);
  fetchStats(id);
  setStatus(`Viewing stats for ${id}`);
}

function stopLogInterval() {
  if (logInterval) {
    clearInterval(logInterval);
    logInterval = null;
  }
}

function resetDetails() {
  stopLogInterval();
  logsView.hide();
  statsView.hide();
  detailsBox.setLabel(' {bold}Details{/bold} ');
  detailsBox.setContent('{center}Select a container and use actions{/center}');
  list.focus();
  setStatus(' [/] Filter | [Enter] Stop | [r] Restart | [d] Delete | [l] Logs | [s] Stats | [q] Quit');
}

/**
 * Container Actions (Stop, Restart, Delete)
 */
async function performAction(action, id) {
  try {
    setStatus(`${action}ing ${id}...`);
    let response;
    if (action === 'stop') response = await axios.post(`${BASE_URL}/containers/${id}/stop`);
    if (action === 'restart') response = await axios.post(`${BASE_URL}/containers/${id}/restart`);
    if (action === 'delete') response = await axios.delete(`${BASE_URL}/containers/${id}`);
    
    if (response.data && response.data.success) {
      setStatus(`${action} successful: ${id}`);
      fetchContainers();
    } else {
      setStatus(response.data.message || 'Action failed', true);
    }
  } catch (error) {
    setStatus(`${action} failed: ${error.message}`, true);
  }
}

function confirmDelete() {
  const id = getSelectedId();
  if (!id) return;
  
  confirmMsg.ask(`Are you sure you want to FORCE DELETE container ${id}?`, (err, data) => {
    if (data) {
      performAction('delete', id);
    } else {
      setStatus('Delete cancelled');
    }
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// Key Bindings & Events
// ─────────────────────────────────────────────────────────────────────────────

// Handle Filter Input
filterInput.on('submit', (value) => {
  filterQuery = value;
  updateListView();
  list.focus();
});

filterInput.key(['escape'], () => {
  filterInput.clearValue();
  filterQuery = '';
  updateListView();
  list.focus();
});

// List interactions
list.on('select', () => performAction('stop', getSelectedId()));

screen.key(['/'], () => filterInput.focus());
screen.key(['r'], () => performAction('restart', getSelectedId()));
screen.key(['d'], () => confirmDelete());
screen.key(['l'], () => showLogs());
screen.key(['s'], () => showStats());
screen.key(['b'], () => resetDetails());
screen.key(['tab'], () => screen.focusNext());
screen.key(['q', 'C-c'], () => process.exit(0));

// Intervals
setInterval(fetchContainers, 3000);

// Initial setup
list.focus();
fetchContainers();
screen.render();
