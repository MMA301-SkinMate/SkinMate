const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
    {
        fullName: {
            type: String,
            required: true,
            trim: true,
            minlength: 2,
            maxlength: 100,
        },
        email: {
            type: String,
            required: true,
            trim: true,
            lowercase: true,
            maxlength: 254,
        },
        passwordHash: { type: String, required: true, select: false },
        emailVerified: { type: Boolean, default: false },
        termsAcceptedAt: { type: Date, required: true },
        termsVersion: { type: String, required: true },
        privacyVersion: { type: String, required: true },
    },
    {
        timestamps: true,
        toJSON: {
            transform(_document, value) {
                delete value.passwordHash;
                return value;
            },
        },
    }
);

userSchema.index({ email: 1 }, { unique: true });

module.exports = mongoose.model('User', userSchema);
