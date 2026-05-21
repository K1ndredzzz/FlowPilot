const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');

const sidepanelSource = fs.readFileSync('sidepanel/sidepanel.js', 'utf8');

test('sidepanel source does not keep auto-run ad rendering hooks', () => {
  assert.doesNotMatch(sidepanelSource, /extension_auto_run_ad/);
  assert.doesNotMatch(sidepanelSource, /getAutoRunAdConfig/);
  assert.doesNotMatch(sidepanelSource, /renderAutoRunAd/);
  assert.doesNotMatch(sidepanelSource, /autoRunAdBar/);
  assert.doesNotMatch(sidepanelSource, /auto-run-ad-link/);
});
