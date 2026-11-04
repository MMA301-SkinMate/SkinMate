const mongoose = require('mongoose');

const routineDaySchema = new mongoose.Schema({
    dayNumber: { type: Number, required: true, min: 1 },
    morningProducts: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Collection' }],
    eveningProducts: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Collection' }],
}, { _id: false });

const routinePlanSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    title: { type: String, trim: true, maxlength: 150, default: 'Personal routine' },
    startDate: { type: String, required: true },
    totalDays: { type: Number, required: true, min: 1, max: 365 },
    currentDay: { type: Number, min: 1, default: 1 },
    status: { type: String, enum: ['draft', 'active', 'completed', 'cancelled'], default: 'active', index: true },
    source: { type: String, enum: ['collection', 'ai', 'mixed'], default: 'collection' },
    profileSnapshot: { type: mongoose.Schema.Types.Mixed, default: null },
    explanation: { type: String, trim: true, default: null },
    stepReasons: { type: mongoose.Schema.Types.Mixed, default: {} },
    externalSuggestions: { type: [mongoose.Schema.Types.Mixed], default: [] },
    days: { type: [routineDaySchema], default: [] },
}, { timestamps: true });

routinePlanSchema.index({ userId: 1, status: 1 });

module.exports = mongoose.model('RoutinePlan', routinePlanSchema);
