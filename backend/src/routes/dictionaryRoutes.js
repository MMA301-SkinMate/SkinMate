const express = require('express');
const router = express.Router();
const {
  SKIN_DICTIONARY,
  CONDITION_DICTIONARY,
  CONFLICT_MATRIX,
  getSkinProfile,
  getConditionProfile,
} = require('../constants/skinDictionary');

/**
 * @route   GET /api/dictionary
 * @desc    Get full skin dictionary, condition dictionary, and conflict matrix
 * @access  Public
 */
router.get('/', (req, res) => {
  return res.status(200).json({
    success: true,
    data: {
      skinDictionary: SKIN_DICTIONARY,
      conditionDictionary: CONDITION_DICTIONARY,
      conflictMatrix: CONFLICT_MATRIX,
    },
  });
});

/**
 * @route   GET /api/dictionary/skin-types
 * @desc    Get skin profile dictionary list
 * @access  Public
 */
router.get('/skin-types', (req, res) => {
  return res.status(200).json({
    success: true,
    data: SKIN_DICTIONARY,
  });
});

/**
 * @route   GET /api/dictionary/conditions
 * @desc    Get condition dictionary list
 * @access  Public
 */
router.get('/conditions', (req, res) => {
  return res.status(200).json({
    success: true,
    data: CONDITION_DICTIONARY,
  });
});

/**
 * @route   GET /api/dictionary/conflicts
 * @desc    Get active conflict matrix
 * @access  Public
 */
router.get('/conflicts', (req, res) => {
  return res.status(200).json({
    success: true,
    data: CONFLICT_MATRIX,
  });
});

/**
 * @route   GET /api/dictionary/skin-types/:type
 * @desc    Get specific skin profile by type
 * @access  Public
 */
router.get('/skin-types/:type', (req, res) => {
  const profile = getSkinProfile(req.params.type);
  return res.status(200).json({
    success: true,
    data: profile,
  });
});

module.exports = router;
