const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');

const source = fs.readFileSync('sidepanel/contribution-content-update-service.js', 'utf8');

function createContributionContentService() {
  const cache = new Map();
  const windowObject = {};
  const fetchUrls = [];

  const localStorage = {
    getItem(key) {
      return cache.has(key) ? cache.get(key) : null;
    },
    setItem(key, value) {
      cache.set(key, String(value));
    },
    removeItem(key) {
      cache.delete(key);
    },
  };

  const fetchImpl = async (...args) => {
    fetchUrls.push(String(args[0] || ''));
    throw new Error('content summary service must not fetch remote URLs');
  };

  const api = new Function(
    'window',
    'localStorage',
    'fetch',
    `${source}; return window.SidepanelContributionContentService;`
  )(
    windowObject,
    localStorage,
    fetchImpl
  );

  return {
    api,
    getFetchUrls() {
      return fetchUrls.slice();
    },
    getCacheValue(key) {
      return cache.get(key);
    },
  };
}

test('content update service no longer exposes the original author portal URL', () => {
  const { api } = createContributionContentService();

  assert.equal(api.portalUrl, '');
  assert.equal(api.apiUrl, '');
  assert.equal(api.buildSummaryApiUrl({ flowId: 'kiro', targetId: 'kiro-rs' }), '');
});

test('getContentUpdateSnapshot returns a local idle snapshot without fetching remote content', async () => {
  const service = createContributionContentService();
  const snapshot = await service.api.getContentUpdateSnapshot({ flowId: 'kiro', targetId: 'kiro-rs' });

  assert.equal(snapshot.status, 'idle');
  assert.equal(snapshot.promptVersion, '');
  assert.equal(snapshot.hasVisibleUpdates, false);
  assert.equal(snapshot.flowId, 'kiro');
  assert.equal(snapshot.targetId, 'kiro-rs');
  assert.equal(snapshot.portalUrl, '');
  assert.equal(snapshot.apiUrl, '');
  assert.deepEqual(snapshot.items, []);
  assert.deepEqual(service.getFetchUrls(), []);
});
