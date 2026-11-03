const assert = require('node:assert/strict');
const { test } = require('node:test');
const express = require('express');
const request = require('supertest');
const { errorHandler } = require('../middlewares/errorMiddleware');

test('copying a community routine requires an authenticated session', async () => {
  const app = express();
  app.use(require('./communityRoutes'));
  app.use(errorHandler);
  const response = await request(app)
    .post('/507f1f77bcf86cd799439011/copy')
    .expect(401);
  assert.equal(response.body.error.code, 'AUTH_REQUIRED');
});
