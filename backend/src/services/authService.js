const mongoose = require('mongoose');
const argon2 = require('argon2');
const User = require('../models/User');
const authSessionService = require('./authSessionService');
const AppError = require('../utils/AppError');

const emailAlreadyExists = () =>
    new AppError(
        'Email này đã được đăng ký. Vui lòng đăng nhập.',
        409,
        'EMAIL_ALREADY_EXISTS',
        [{ field: 'email', message: 'Email này đã được đăng ký.' }]
    );

const register = async (input, config) => {
    const email = input.email.trim().toLowerCase();

    if (await User.exists({ email })) {
        throw emailAlreadyExists();
    }

    // Hash before opening the transaction so expensive CPU work holds no locks.
    const passwordHash = await argon2.hash(input.password, {
        type: argon2.argon2id,
        memoryCost: 19456,
        timeCost: 2,
        parallelism: 1,
    });

    try {
        return await mongoose.connection.transaction(async (transaction) => {
            const user = new User({
                fullName: input.fullName,
                email,
                passwordHash,
                termsAcceptedAt: new Date(),
                termsVersion: config.termsVersion,
                privacyVersion: config.privacyVersion,
            });
            await user.save({ session: transaction });

            const tokens = await authSessionService.createInitialSession(
                user,
                config,
                transaction
            );

            return {
                user: {
                    id: user.id,
                    fullName: user.fullName,
                    email: user.email,
                },
                ...tokens,
            };
        });
    } catch (error) {
        // The unique index is authoritative when registrations race each other.
        if (
            error.code === 11000 &&
            (error.keyPattern?.email || error.keyValue?.email)
        ) {
            throw emailAlreadyExists();
        }
        throw error;
    }
};

module.exports = { register };
