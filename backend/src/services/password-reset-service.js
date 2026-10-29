const { createHash, randomBytes } = require('node:crypto');
const argon2 = require('argon2');
const User = require('../models/User');
const AppError = require('../utils/AppError');

const hashToken = token => createHash('sha256').update(token).digest('hex');
const invalidToken = () => new AppError(
    'Liên kết không hợp lệ hoặc đã hết hạn. Vui lòng yêu cầu liên kết mới.',
    400,
    'INVALID_RESET_TOKEN'
);

const requestReset = async ({ email }, config) => {
    if (!config.resetEmailApiKey || !config.resetEmailFrom || !config.passwordResetUrl) {
        throw new AppError('Chức năng gửi email chưa được cấu hình.', 503, 'MAIL_UNAVAILABLE');
    }
    const token = randomBytes(32).toString('hex');
    const tokenHash = hashToken(token);
    const user = await User.findOneAndUpdate(
        { email, isActive: { $ne: false } },
        { $set: {
            passwordResetTokenHash: tokenHash,
            passwordResetExpiresAt: new Date(Date.now() + 15 * 60 * 1000),
        } },
        { returnDocument: 'after' }
    );
    if (!user) return { accountNotEligible: true };

    const url = new URL(config.passwordResetUrl);
    url.searchParams.set('token', token);
    let providerStatus;
    let providerError;
    try {
        const response = await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${config.resetEmailApiKey}`,
                'Content-Type': 'application/json',
            },
            signal: AbortSignal.timeout(10000),
            body: JSON.stringify({
                from: config.resetEmailFrom,
                to: [user.email],
                subject: 'SkinMate — Đặt lại mật khẩu',
                text: `Bạn đã yêu cầu đặt lại mật khẩu SkinMate. Mở liên kết dưới đây trên thiết bị có ứng dụng:\n\n${url.href}\n\nLiên kết có hiệu lực 15 phút và chỉ dùng một lần. Nếu không yêu cầu, bạn có thể bỏ qua email này.`,
            }),
        });
        providerStatus = response.status;
        if (!response.ok) {
            const body = await response.json().catch(() => ({}));
            const allowed = new Set([
                'validation_error', 'missing_api_key', 'invalid_api_key',
                'restricted_api_key', 'invalid_access', 'rate_limit_exceeded',
                'daily_quota_exceeded', 'monthly_quota_exceeded',
                'application_error', 'internal_server_error',
            ]);
            providerError = allowed.has(body.name) ? body.name : 'UNCLASSIFIED';
            throw new Error('Mail provider rejected request.');
        }
        return { deliveryAccepted: true };
    } catch (error) {
        await User.updateOne(
            { _id: user._id, passwordResetTokenHash: tokenHash },
            { $unset: { passwordResetTokenHash: '', passwordResetExpiresAt: '' } }
        );
        // Preserve the same public response for existing and unknown accounts.
        // Do not log the provider response, recipient, token or recovery URL.
        return {
            deliveryFailed: true,
            providerStatus,
            providerError: providerError || (error.name === 'TimeoutError' ? 'TIMEOUT' : 'NETWORK_ERROR'),
        };
    }
};

const resetPassword = async ({ token, password }) => {
    const filter = {
        passwordResetTokenHash: hashToken(token),
        passwordResetExpiresAt: { $gt: new Date() },
        isActive: { $ne: false },
    };
    if (!await User.exists(filter)) throw invalidToken();
    const passwordHash = await argon2.hash(password, {
        type: argon2.argon2id, memoryCost: 19456, timeCost: 2, parallelism: 1,
    });
    // Conditional single-document update consumes the token atomically, including
    // on standalone MongoDB. Concurrent requests cannot both change the password.
    const user = await User.findOneAndUpdate(
        { ...filter, passwordResetExpiresAt: { $gt: new Date() } },
        {
            $set: { passwordHash, passwordChangedAt: new Date() },
            $unset: { passwordResetTokenHash: '', passwordResetExpiresAt: '' },
        },
        { returnDocument: 'after', runValidators: true }
    );
    if (!user) throw invalidToken();
};

module.exports = { requestReset, resetPassword };
