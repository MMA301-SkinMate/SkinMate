/**
 * collectionService.js
 *
 * Pure business logic for the Collection (Tủ đồ) module.
 * No req / res objects — only domain operations that controllers delegate to.
 */

const mongoose = require('mongoose');
const Collection = require('../models/Collection');
const DailyRoutine = require('../models/DailyRoutine');

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

/** Today's date string "YYYY-MM-DD" in server local time */
function todayString() {
    return new Date().toISOString().split('T')[0];
}

/** Days remaining until expirationDate (negative when past due) */
function daysUntilExpiry(product) {
    const expiryValue = product.expirationDate || product.finalExpiryDate;
    if (!expiryValue) return null;
    const expiry = new Date(expiryValue);
    const now    = new Date();
    expiry.setHours(0, 0, 0, 0);
    now.setHours(0, 0, 0, 0);
    return Math.ceil((expiry - now) / 86_400_000);
}

function resolveExpiryDate({ openedDate, expirationDate, expiryDate, finalExpiryDate, durationMonths }) {
    const explicitDate = expirationDate || expiryDate || finalExpiryDate;
    if (explicitDate) return new Date(explicitDate);
    if (!openedDate || !durationMonths) return null;

    const result = new Date(openedDate);
    result.setMonth(result.getMonth() + Number(durationMonths));
    return result;
}

/** Validate ObjectId or throw a 400-like error */
function requireValidId(id) {
    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
        const err  = new Error('Invalid ID format');
        err.statusCode = 400;
        throw err;
    }
}

/**
 * Find the best replacement product for a given product being removed/finished.
 * Strategy:
 *  1. Same productType, active or expired_warning, not the product itself.
 *  2. If none, find any active product that shares at least one ingredient.
 *  3. Returns null when no candidate exists.
 */
async function findReplacement(userId, excludeProductId, productType, ingredients) {
    // Priority 1 — same category
    const sameType = await Collection.findOne({
        userId,
        _id:    { $ne: excludeProductId },
        status: { $in: ['active', 'expired_warning'] },
        productType,
    }).lean();
    if (sameType) return sameType;

    // Priority 2 — shared ingredients
    if (ingredients && ingredients.length) {
        const shared = await Collection.findOne({
            userId,
            _id:         { $ne: excludeProductId },
            status:      { $in: ['active', 'expired_warning'] },
            ingredients: { $in: ingredients },
        }).lean();
        if (shared) return shared;
    }

    return null;
}

/**
 * Update every DailyRoutine (today + future) that contains `productId`.
 * Swaps to `replacementId` if available, otherwise just removes the slot.
 */
async function swapOrRemoveInRoutines(userId, productId, replacementId) {
    const today   = todayString();
    const filter  = {
        userId,
        date: { $gte: today },
        $or:  [
            { morningProducts: productId },
            { eveningProducts: productId },
        ],
    };

    const routines = await DailyRoutine.find(filter).lean();
    if (!routines.length) return 0;

    const updateOps = routines.map((routine) => {
        const setObj = {};

        if (routine.morningProducts.some(id => id.toString() === productId.toString())) {
            // Pull old, optionally push new
            const updated = routine.morningProducts
                .filter(id => id.toString() !== productId.toString());
            if (replacementId) updated.push(replacementId);
            setObj.morningProducts = updated;
        }

        if (routine.eveningProducts.some(id => id.toString() === productId.toString())) {
            const updated = routine.eveningProducts
                .filter(id => id.toString() !== productId.toString());
            if (replacementId) updated.push(replacementId);
            setObj.eveningProducts = updated;
        }

        return {
            updateOne: {
                filter: { _id: routine._id },
                update: { $set: setObj },
            },
        };
    });

    const result = await DailyRoutine.bulkWrite(updateOps);
    return result.modifiedCount;
}

// ---------------------------------------------------------------------------
// Public service functions
// ---------------------------------------------------------------------------

/**
 * List products for a user by tab.
 *  tab = 'active' → status in [active, expired_warning]
 *  tab = 'used'   → status in [used_up]
 */
async function getAllProducts(userId, { tab = 'active' } = {}) {
    const statusFilter =
        tab === 'used'
            ? { $in: ['used_up'] }
            : { $in: ['active', 'expired_warning'] };

    const products = await Collection.find({ userId, status: statusFilter })
        .sort({ createdAt: -1 })
        .lean();

    return products;
}

/** Fetch a single product belonging to this user */
async function getProductById(userId, productId) {
    requireValidId(productId);

    const product = await Collection.findOne({ _id: productId, userId }).lean();
    if (!product) {
        const err      = new Error('Sản phẩm không tồn tại hoặc bạn không có quyền truy cập.');
        err.statusCode = 404;
        throw err;
    }
    return product;
}

/**
 * Create a new product in the collection.
 * Allowed payload fields: productName, productType, productIcon, ingredients,
 *   openedDate, expirationDate, note, status, analysisResult.
 * If expirationDate is within 7 days, override status to 'expired_warning'.
 */
async function createProduct(userId, payload) {
    const {
        productName,
        productType,
        productIcon,
        ingredients,
        openedDate,
        expirationDate,
        expiryDate,
        durationMonths,
        finalExpiryDate,
        note,
        analysisResult,
        status = 'active',
    } = payload;

    const doc = new Collection({
        userId,
        productName,
        productType,
        productIcon,
        ingredients: Array.isArray(ingredients) ? ingredients : [],
        openedDate:  openedDate  || null,
        durationMonths: durationMonths || null,
        expirationDate: resolveExpiryDate({ openedDate, expirationDate, expiryDate, finalExpiryDate, durationMonths }),
        finalExpiryDate: finalExpiryDate || null,
        note:        note        || null,
        analysisResult: analysisResult || null,
        status,
    });

    // Auto-promote to expired_warning if already close to expiry
    const days = daysUntilExpiry(doc);
    if (days !== null && days <= 7 && doc.status === 'active') {
        doc.status = 'expired_warning';
    }

    await doc.save();
    return doc.toObject();
}

/**
 * Update allowed fields for a product.
 * After update, re-evaluates expiry status.
 */
async function updateProduct(userId, productId, updates) {
    requireValidId(productId);

    const ALLOWED = [
        'productName', 'productType', 'productIcon', 'ingredients',
        'openedDate', 'expirationDate', 'expiryDate', 'durationMonths',
        'finalExpiryDate', 'note', 'status', 'continueAfterExpiry',
    ];

    const setData = {};
    for (const key of ALLOWED) {
        if (Object.prototype.hasOwnProperty.call(updates, key)) {
            setData[key] = updates[key];
        }
    }

    if ('expiryDate' in setData && !('expirationDate' in setData)) {
        setData.expirationDate = setData.expiryDate;
        delete setData.expiryDate;
    }

    if ('openedDate' in setData || 'durationMonths' in setData || 'expirationDate' in setData || 'finalExpiryDate' in setData) {
        const current = await Collection.findOne({ _id: productId, userId })
            .select('openedDate expirationDate finalExpiryDate durationMonths')
            .lean();
        if (!current) {
            const err = new Error('Product not found');
            err.statusCode = 404;
            throw err;
        }
        setData.expirationDate = resolveExpiryDate({
            openedDate: setData.openedDate ?? current.openedDate,
            expirationDate: setData.expirationDate ?? current.expirationDate,
            finalExpiryDate: setData.finalExpiryDate ?? current.finalExpiryDate,
            durationMonths: setData.durationMonths ?? current.durationMonths,
        });
    }

    const product = await Collection.findOneAndUpdate(
        { _id: productId, userId },
        { $set: setData },
        { new: true, runValidators: true }
    ).lean();

    if (!product) {
        const err      = new Error('Sản phẩm không tồn tại hoặc bạn không có quyền.');
        err.statusCode = 404;
        throw err;
    }

    // Re-evaluate expiry status if expirationDate was updated
    if ('expirationDate' in setData || 'finalExpiryDate' in setData || 'durationMonths' in setData || 'openedDate' in setData) {
        const days = daysUntilExpiry(product);
        let newStatus = product.status;

        if (days !== null && days <= 7 && product.status === 'active') {
            newStatus = 'expired_warning';
        } else if (days !== null && days > 7 && product.status === 'expired_warning' && !product.continueAfterExpiry) {
            newStatus = 'active';
        }

        if (newStatus !== product.status) {
            return Collection.findByIdAndUpdate(productId, { $set: { status: newStatus } }, { new: true }).lean();
        }
    }

    return product;
}

/**
 * Delete a product.
 * Before deleting, checks whether the product is used in any active DailyRoutine.
 * If yes, attempts automatic replacement; swaps in routines accordingly.
 *
 * Returns: { product, wasInRoutine, replacedWith }
 */
async function deleteProduct(userId, productId) {
    requireValidId(productId);

    const product = await Collection.findOne({ _id: productId, userId }).lean();
    if (!product) {
        const err      = new Error('Sản phẩm không tồn tại hoặc bạn không có quyền xóa.');
        err.statusCode = 404;
        throw err;
    }

    // Check routine usage
    const today  = todayString();
    const inRoutine = await DailyRoutine.exists({
        userId,
        date: { $gte: today },
        $or:  [{ morningProducts: product._id }, { eveningProducts: product._id }],
    });

    let replacedWith = null;
    if (inRoutine) {
        replacedWith = await findReplacement(
            userId, product._id, product.productType, product.ingredients
        );
        const replacementId = replacedWith ? replacedWith._id : null;

        if (!replacementId) {
            console.warn(
                `[collectionService] No replacement found for product ${productId} ` +
                `(type: ${product.productType}). Routine slot will be cleared.`
            );
        }

        await swapOrRemoveInRoutines(userId, product._id, replacementId);
    }

    await Collection.deleteOne({ _id: productId, userId });

    return {
        product,
        wasInRoutine: Boolean(inRoutine),
        replacedWith,
    };
}

/**
 * Mark a product as used_up (đã dùng hết).
 * Same routine-check logic as deleteProduct, but the document stays.
 *
 * Returns: { product, wasInRoutine, replacedWith }
 */
async function markAsUsedUp(userId, productId) {
    requireValidId(productId);

    const product = await Collection.findOne({ _id: productId, userId }).lean();
    if (!product) {
        const err      = new Error('Sản phẩm không tồn tại hoặc bạn không có quyền.');
        err.statusCode = 404;
        throw err;
    }

    const today     = todayString();
    const inRoutine = await DailyRoutine.exists({
        userId,
        date: { $gte: today },
        $or:  [{ morningProducts: product._id }, { eveningProducts: product._id }],
    });

    let replacedWith = null;
    if (inRoutine) {
        replacedWith = await findReplacement(
            userId, product._id, product.productType, product.ingredients
        );
        const replacementId = replacedWith ? replacedWith._id : null;
        await swapOrRemoveInRoutines(userId, product._id, replacementId);
    }

    const updated = await Collection.findByIdAndUpdate(
        productId,
        { $set: { status: 'used_up', continueAfterExpiry: false } },
        { new: true }
    ).lean();

    return {
        product: updated,
        wasInRoutine: Boolean(inRoutine),
        replacedWith,
    };
}

/**
 * Scan all active products for this user and flip status to 'expired_warning'
 * when expirationDate <= now + 7 days.
 * Called at the start of every listProducts request.
 *
 * Returns: { updated: number }
 */
async function checkAndUpdateExpiryStatuses(userId) {
    const warningThreshold = new Date();
    warningThreshold.setDate(warningThreshold.getDate() + 7);
    warningThreshold.setHours(23, 59, 59, 999);

    const result = await Collection.updateMany(
        {
            userId,
            status:         'active',
            expirationDate: { $ne: null, $lte: warningThreshold },
        },
        { $set: { status: 'expired_warning' } }
    );

    return { updated: result.modifiedCount };
}

/**
 * Returns all products where status === 'expired_warning' AND
 * continueAfterExpiry === false.
 * These are presented in the app-open popup.
 */
async function getExpiredWarningProducts(userId) {
    return Collection.find({
        userId,
        status:              'expired_warning',
        continueAfterExpiry: false,
    }).sort({ expirationDate: 1 }).lean();
}

/**
 * Resolve the expired-product popup decision.
 *  action = 'stop'     → status = 'used_up'
 *  action = 'continue' → continueAfterExpiry = true (keep expired_warning for red badge)
 */
async function resolveExpiredProduct(userId, productId, action) {
    requireValidId(productId);

    if (!['stop', 'continue'].includes(action)) {
        const err      = new Error('action phải là "stop" hoặc "continue".');
        err.statusCode = 400;
        throw err;
    }

    const setData = action === 'stop'
        ? { status: 'used_up', continueAfterExpiry: false }
        : { continueAfterExpiry: true };   // keep status as expired_warning → red badge

    const product = await Collection.findOneAndUpdate(
        { _id: productId, userId },
        { $set: setData },
        { new: true }
    ).lean();

    if (!product) {
        const err      = new Error('Sản phẩm không tồn tại.');
        err.statusCode = 404;
        throw err;
    }

    return product;
}

module.exports = {
    getAllProducts,
    getProductById,
    createProduct,
    updateProduct,
    deleteProduct,
    markAsUsedUp,
    checkAndUpdateExpiryStatuses,
    getExpiredWarningProducts,
    resolveExpiredProduct,
};
