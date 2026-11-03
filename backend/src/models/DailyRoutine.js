const mongoose = require('mongoose');

const SKIN_CONDITIONS = [
    'Binh_Thuong',
    'Kho_Rat',
    'Kich_Ung',
    'Noi_Mun',
    'Bong_Dau',
];

const dailyRoutineSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        routinePlanId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'RoutinePlan',
            default: null,
            index: true,
        },
        date: {
            type: String,
            required: true,
        },
        skinCondition: {
            type: String,
            enum: SKIN_CONDITIONS,
            default: 'Binh_Thuong',
        },
        // New check-in format. skinCondition above remains as the primary
        // value so existing scan/analysis code continues to work.
        skinConditions: {
            type: [{ type: String, enum: SKIN_CONDITIONS }],
            default: ['Binh_Thuong'],
        },
        morningProducts: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Collection',
            },
        ],
        eveningProducts: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Collection',
            },
        ],
        // Optional metadata for a multi-day treatment plan. Existing routines
        // do not need these fields and remain fully compatible.
        routineGroupId: { type: String, trim: true, default: null },
        dayNumber: { type: Number, min: 1, default: null },
        totalDays: { type: Number, min: 1, default: null },
        isOverridden: { type: Boolean, default: false },
        overrideReason: { type: String, trim: true, default: null },
    },
    { timestamps: true }
);

dailyRoutineSchema.index({ userId: 1, date: 1 }, { unique: true });

module.exports = mongoose.model('DailyRoutine', dailyRoutineSchema);
module.exports.SKIN_CONDITIONS = SKIN_CONDITIONS;
