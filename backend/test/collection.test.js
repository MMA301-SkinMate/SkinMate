const assert = require('node:assert/strict');
const { test } = require('node:test');
const validators = require('../src/validations/collectionDto');

function validate(middleware, body) {
  const req = { body, params: { id: '507f1f77bcf86cd799439011' } };
  let response;
  middleware(req, { status: code => ({ json: value => { response = { code, value }; } }) }, () => { response = { code: 200, value: req.body }; });
  return response;
}

test('collection creation requires name and product type', () => {
  assert.equal(validate(validators.create, { productName: 'Cleanser' }).code, 400);
  const result = validate(validators.create, { productName: ' Cleanser ', productType: 'cleanser', remainingPercent: 50 });
  assert.equal(result.code, 200);
  assert.equal(result.value.productName, 'Cleanser');
});

test('collection updates reject invalid status and allow percentages', () => {
  assert.equal(validate(validators.update, { status: 'deleted' }).code, 400);
  assert.equal(validate(validators.update, { remainingPercent: 42 }).code, 200);
  assert.equal(validate(validators.update, { status: 'finished' }).code, 200);
  assert.equal(validate(validators.update, { status: 'expired' }).code, 200);
  assert.equal(validate(validators.update, { status: 'draft' }).code, 200);
  assert.equal(validate(validators.update, { continueAfterExpiry: true }).code, 200);
  assert.equal(validate(validators.update, { productIcon: 'serum' }).code, 200);
  assert.equal(validate(validators.update, { productType: 'moisturizer' }).code, 200);
});

test('collection id validation treats malformed identifiers as not found', () => {
  let response;
  validators.id({ params: { id: 'not-an-id' } }, { status: code => ({ json: value => { response = { code, value }; } }) }, () => {});
  assert.equal(response.code, 404);
  assert.equal(response.value.error.code, 'COLLECTION_NOT_FOUND');
});
