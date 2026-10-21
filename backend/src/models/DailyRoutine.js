const mongoose = require('mongoose');

const dailyRoutineSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        date: {
            type: String,
            required: true,
        },
        skinCondition: {
            type: String,
            enum: ['Binh_Thuong', 'Kho_Rat', 'Kich_Ung', 'Noi_Mun', 'Bong_Dau'],
            default: 'Binh_Thuong',
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
    },
    { timestamps: true }
);

dailyRoutineSchema.index({ userId: 1, date: 1 }, { unique: true });

module.exports = mongoose.model('DailyRoutine', dailyRoutineSchema);