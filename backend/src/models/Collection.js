const mongoose = require('mongoose');

const productTypes = [
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

const productIcons = [
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

const statuses = ['draft', 'active', 'finished', 'expired'];

const collectionSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
            index: true,
        },

        productName: {
            type: String,
            required: true,
            trim: true,
            maxlength: 150,
        },

        productType: {
            type: String,
            required: true,
            enum: productTypes,
        },

        productIcon: {
            type: String,
            enum: productIcons,
            default: 'serum',
        },

        productImageUrl: {
            type: String,
            default: null,
            trim: true,
        },

        ingredients: {
            type: [String],
            default: [],
        },

        analysisResult: {
            baseScore: { type: Number, default: 70 },
            contextualScore: { type: Number, default: 70 },
            verdict: { type: mongoose.Schema.Types.Mixed, default: null },
            conflictResolution: { type: mongoose.Schema.Types.Mixed, default: null },
            pairingRecommendation: { type: mongoose.Schema.Types.Mixed, default: null },
            bestPairingInCloset: { type: mongoose.Schema.Types.Mixed, default: null },
            futurePlan: { type: mongoose.Schema.Types.Mixed, default: null },
        },

        openedDate: {
            type: Date,
            default: null,
        },

        expirationDate: {
            type: Date,
            default: null,
        },

        paoMonths: {
            type: Number,
            default: null,
            min: 1,
        },

        finalExpiryDate: {
            type: Date,
            default: null,
        },

        note: {
            type: String,
            default: null,
            trim: true,
            maxlength: 1000,
        },

        status: {
            type: String,
            enum: statuses,
            default: 'draft',
            index: true,
        },

        continueAfterExpiry: {
            type: Boolean,
            default: false,
        },

        brand: {
            type: String,
            default: '',
            trim: true,
            maxlength: 100,
        },

        size: {
            type: String,
            default: '',
            trim: true,
            maxlength: 50,
        },

        remainingPercent: {
            type: Number,
            default: 100,
            min: 0,
            max: 100,
        },

        routineUsage: {
            morning: {
                type: Boolean,
                default: false,
            },
            evening: {
                type: Boolean,
                default: false,
            },
            step: {
                type: Number,
                default: null,
                min: 1,
            },
        },
    },
    {
        timestamps: true,
    }
);

collectionSchema.index(
    { createdAt: 1 },
    {
        expireAfterSeconds: 2592000, // 30 days
        partialFilterExpression: { status: 'draft' },
    }
);

collectionSchema.index({ userId: 1, status: 1 });
collectionSchema.index({ userId: 1, expirationDate: 1 });

const Collection = mongoose.model('Collection', collectionSchema);

module.exports = Collection;
module.exports.productTypes = productTypes;
module.exports.productIcons = productIcons;
module.exports.statuses = statuses;
