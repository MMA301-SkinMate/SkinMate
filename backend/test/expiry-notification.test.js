const assert = require('node:assert/strict');
const { test } = require('node:test');
const { daysUntilExpiration, localDateKey, isoWeekKey } = require('../src/services/expiryNotificationService');

const productWithExpiration = expirationDate => ({ expirationDate });

test('expiry notification dates use Vietnam calendar days', () => {
  const now = new Date('2026-10-21T01:00:00.000Z'); // 08:00 in Asia/Ho_Chi_Minh
  assert.equal(localDateKey(now), '2026-10-21');
  assert.equal(daysUntilExpiration(productWithExpiration('2026-10-28T00:00:00.000Z'), now), 7);
  assert.equal(daysUntilExpiration(productWithExpiration('2026-10-21T00:00:00.000Z'), now), 0);
  assert.equal(daysUntilExpiration(productWithExpiration('2026-10-20T00:00:00.000Z'), now), -1);
});

test('weekly reminder key is stable for every date in a week', () => {
  assert.equal(isoWeekKey(new Date('2026-10-19T01:00:00.000Z')), isoWeekKey(new Date('2026-10-25T01:00:00.000Z')));
});
