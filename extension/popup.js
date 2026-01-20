const DEFAULT_API_BASE_URL = 'http://localhost:3000';

const leetcodeInput = document.getElementById('leetcode-username');
const detectSessionButton = document.getElementById('detect-session');
const syncButton = document.getElementById('sync-btn');
const sessionStatus = document.getElementById('session-status');
const syncStatus = document.getElementById('sync-status');
const apiStatus = document.getElementById('api-status');

const setStatus = (element, message, isError = false) => {
  element.textContent = message;
  element.style.color = isError ? '#dc2626' : '#1f2937';
};

const loadState = () => {
  chrome.storage.local.get(['leetcodeUsername', 'userId', 'apiBaseUrl'], (data) => {
    if (data.leetcodeUsername) {
      leetcodeInput.value = data.leetcodeUsername;
    }

    if (data.userId) {
      setStatus(sessionStatus, `Connected user: ${data.userId}`);
    }

    const apiBaseUrl = data.apiBaseUrl || DEFAULT_API_BASE_URL;
    apiStatus.textContent = `API: ${apiBaseUrl}`;
  });
};

const saveUsername = () => {
  const value = leetcodeInput.value.trim();
  chrome.storage.local.set({ leetcodeUsername: value });
};

const detectSession = async () => {
  setStatus(sessionStatus, 'Detecting AlgoAxis session...');
  syncStatus.textContent = '';

  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (!tab || !tab.id || !tab.url || !tab.url.startsWith('http')) {
    setStatus(sessionStatus, 'Open AlgoAxis in a browser tab first.', true);
    return;
  }

  let result;
  try {
    const response = await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: () => ({
        userId: localStorage.getItem('user_id'),
        userName: localStorage.getItem('user_name')
      })
    });
    result = response && response[0] && response[0].result;
  } catch (error) {
    setStatus(sessionStatus, 'Unable to read AlgoAxis session.', true);
    return;
  }

  if (!result || !result.userId) {
    setStatus(sessionStatus, 'No AlgoAxis session found. Log in first.', true);
    return;
  }

  const apiBaseUrl = new URL(tab.url).origin;
  chrome.storage.local.set({
    userId: result.userId,
    apiBaseUrl
  });

  setStatus(sessionStatus, `Connected user: ${result.userId}`);
  apiStatus.textContent = `API: ${apiBaseUrl}`;
};

const syncNow = async () => {
  syncStatus.textContent = '';

  const leetcodeUsername = leetcodeInput.value.trim();
  if (!leetcodeUsername) {
    setStatus(syncStatus, 'Enter a LeetCode username first.', true);
    return;
  }

  chrome.storage.local.get(['userId', 'apiBaseUrl'], async (data) => {
    const userId = data.userId;
    const apiBaseUrl = data.apiBaseUrl || DEFAULT_API_BASE_URL;

    if (!userId) {
      setStatus(syncStatus, 'Connect your AlgoAxis session first.', true);
      return;
    }

    setStatus(syncStatus, 'Syncing...');

    try {
      const response = await fetch(`${apiBaseUrl}/api/leetcode/sync`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: userId,
          leetcode_username: leetcodeUsername
        })
      });

      const payload = await response.json();
      if (!response.ok) {
        setStatus(syncStatus, payload.error || 'Sync failed.', true);
        return;
      }

      const summary = `Added ${payload.added}, updated ${payload.updated}.`;
      setStatus(syncStatus, summary);
      saveUsername();
    } catch (error) {
      setStatus(syncStatus, 'Sync failed. Check your API URL.', true);
    }
  });
};

leetcodeInput.addEventListener('input', saveUsername);
detectSessionButton.addEventListener('click', detectSession);
syncButton.addEventListener('click', syncNow);

loadState();
