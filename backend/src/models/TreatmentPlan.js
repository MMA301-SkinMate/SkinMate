const mongoose = require('mongoose');

const treatmentPlanSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
            index: true,
        },
        title: {
            type: String,
            required: true,
            trim: true,
            default: 'Chuỗi Routine 7 Ngày Cấp Ẩm Căng Bóng',
        },
        goal: {
            type: String,
            default: 'Cấp ẩm sâu & duy trì làn da căng bóng',
        },
        skinTypeTarget: {
            type: String,
            default: 'normal',
        },
        durationDays: {
            type: Number,
            default: 7,
        },
        status: {
            type: String,
            enum: ['draft', 'active', 'completed', 'cancelled'],
            default: 'draft',
            index: true,
        },
        startDate: {
            type: Date,
            default: null,
        },
        endDate: {
            type: Date,
            default: null,
        },
        currentDay: {
            type: Number,
            default: 1,
        },
        isOriginalSuggested: {
            type: Boolean,
            default: true,
        },
        sourceRoutineId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'TreatmentPlan',
            default: null,
        },
        notes: {
            type: String,
            default: '',
        },
    },
    {
        timestamps: true,
    }
);

treatmentPlanSchema.index({ userId: 1, status: 1 });

module.exports = mongoose.model('TreatmentPlan', treatmentPlanSchema);
