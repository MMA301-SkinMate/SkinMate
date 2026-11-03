const mongoose = require('mongoose');

// ---------------------------------------------------------------------------
// Constants — exported so frontend constants (product-icons.js) stay in sync
// ---------------------------------------------------------------------------
const PRODUCT_TYPE_VALUES = [
    'cleanser',
    'toner',
    'essences',
    'cream',
    'oil',
    'serum',
    'treatment',
    'moisturizer',
    'sunscreen',
    'mask',
    'exfoliant',
    'others',
];

const PRODUCT_ICON_VALUES = [
    'serum',
    'chai_to',
    'hu',
    'tuyp_xanh',
    'oil',
    'pum',
    'mask',
    'tuyp',
    'xit',
];

// draft      — scanned but not confirmed
// active     — currently in use
// used_up    — manually marked as finished / empty
// expired_warning — expirationDate <= today+7 days; shown in popup; kept in
//               "Đang sử dụng" tab when continueAfterExpiry=true
const COLLECTION_STATUSES = ['draft', 'active', 'used_up', 'expired_warning'];

// ---------------------------------------------------------------------------
// Schema
// ---------------------------------------------------------------------------
const analysisResultSchema = new mongoose.Schema(
    {
        baseScore:             { type: Number, default: null },
        contextualScore:       { type: Number, default: null },
        verdict:               { type: mongoose.Schema.Types.Mixed, default: null },
        conflictResolution:    { type: mongoose.Schema.Types.Mixed, default: null },
        pairingRecommendation: { type: mongoose.Schema.Types.Mixed, default: null },
        futurePlan:            { type: mongoose.Schema.Types.Mixed, default: null },
    },
    { _id: false }
);

const collectionSchema = new mongoose.Schema(
    {
        userId: {
            type:     mongoose.Schema.Types.ObjectId,
            ref:      'User',
            required: true,
            index:    true,
        },

        productName: {
            type:      String,
            required:  true,
            trim:      true,
            maxlength: 150,
        },

        productType: {
            type:     String,
            required: true,
            enum:     PRODUCT_TYPE_VALUES,
        },

        productIcon: {
            type:    String,
            enum:    PRODUCT_ICON_VALUES,
            default: 'serum',
        },

        // Array of raw ingredient strings — used for conflict-check in routines
        ingredients: {
            type:    [String],
            default: [],
        },

        // Embedded AI-analysis result from scan flow (optional)
        analysisResult: {
            type:    analysisResultSchema,
            default: null,
        },

        openedDate: {
            type:    Date,
            default: null,
        },

        durationMonths: {
            type: Number,
            min: 1,
            max: 3650,
            default: null,
        },

        // Computed by client (either direct date or openedDate + durationMonths)
        expirationDate: {
            type:    Date,
            default: null,
        },

        finalExpiryDate: {
            type: Date,
            default: null,
        },

        note: {
            type:      String,
            trim:      true,
            maxlength: 1000,
            default:   null,
        },

        status: {
            type:    String,
            enum:    COLLECTION_STATUSES,
            default: 'draft',
            index:   true,
        },

        // true  → keep product in "Đang sử dụng" with red badge after expiry
        // false → product should be surfaced in expired-alert popup
        continueAfterExpiry: {
            type:    Boolean,
            default: false,
        },
    },
    { timestamps: true }
);

// ---------------------------------------------------------------------------
// Indexes
// ---------------------------------------------------------------------------

// Auto-delete drafts after 30 days (user never confirmed them)
collectionSchema.index(
    { createdAt: 1 },
    {
        expireAfterSeconds:        2592000, // 30 days
        partialFilterExpression:   { status: 'draft' },
    }
);

collectionSchema.index({ userId: 1, status: 1 });
collectionSchema.index({ userId: 1, expirationDate: 1 });

// ---------------------------------------------------------------------------
// Model & named exports
// ---------------------------------------------------------------------------
const Collection = mongoose.model('Collection', collectionSchema);

module.exports = Collection;
module.exports.COLLECTION_STATUSES  = COLLECTION_STATUSES;
module.exports.PRODUCT_TYPE_VALUES  = PRODUCT_TYPE_VALUES;
module.exports.PRODUCT_ICON_VALUES  = PRODUCT_ICON_VALUES;

// Backward-compat aliases used by collectionDto.js / other code
module.exports.productTypes = PRODUCT_TYPE_VALUES;
module.exports.productIcons = PRODUCT_ICON_VALUES;
module.exports.statuses     = COLLECTION_STATUSES;
