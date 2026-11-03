const mongoose = require('mongoose');
const Community = require('../models/Community');
const Collection = require('../models/Collection');
const RoutinePlan = require('../models/RoutinePlan');
const DailyRoutine = require('../models/DailyRoutine');
const { uploadToCloudinary } = require('../services/cloudinaryService');
const { notFound } = require('../validations/postDto');

const DEFAULT_USER_ID = '6ad620492ae8913ed1eb2871';
const PAGE_SIZE = 20;

const currentUserId = req => req.user?.id || req.userId || DEFAULT_USER_ID;

const getSkinTypes = post => {
  if (Array.isArray(post.skinTypes) && post.skinTypes.length) return post.skinTypes;
  return post.skinType ? [post.skinType] : [];
};

const normalizeSkinTypes = (body, req) => {
  if (Array.isArray(body.skinTypes)) {
    return { ...body, skinTypes: body.skinTypes, skinType: body.skinTypes[0] || null };
  }
  const profileSkinType = req.user?.skinProfile?.skinType;
  if (profileSkinType) return { ...body, skinTypes: [profileSkinType], skinType: profileSkinType };
  return body;
};

const serialize = (post, userId) => ({
  id: post._id.toString(),
  authorId: post.userId.toString(),
  authorName: post.authorName,
  content: post.content,
  title: post.title || null,
  note: post.note || post.content || null,
  images: post.images || [],
  tags: post.tags || [],
  skinType: post.skinType,
  skinTypes: getSkinTypes(post),
  skinConditions: post.skinConditions || [],
  sharedRoutine: {
    morning: post.sharedRoutine?.morning || [],
    evening: post.sharedRoutine?.evening || [],
    days: post.sharedRoutine?.days,
  },
  status: post.status,
  likesCount: post.likesCount,
  copiesCount: post.copiesCount,
  isLiked: (post.likedBy || []).some(id => id.toString() === userId),
  createdAt: post.createdAt,
  updatedAt: post.updatedAt,
});

exports.uploadImages = async (req, res, next) => {
  try {
    if (!req.files?.length) return res.status(400).json({ error: { message: 'A JPG, PNG, or WebP image is required', code: 'INVALID_IMAGE' } });
    const images = [];
    for (const file of req.files) {
      const result = await uploadToCloudinary(file, 'skinmate/community');
      images.push(result.secureUrl);
    }
    res.status(201).json({ images });
  } catch (error) {
    res.status(error.code === 'CLOUDINARY_NOT_CONFIGURED' ? 503 : 502);
    next(error);
  }
};

exports.list = async (req, res, next) => {
  try {
    const userId = currentUserId(req);
    const filter = { status: 'published' };
    if (req.query.skinType) filter.$or = [{ skinTypes: req.query.skinType }, { skinType: req.query.skinType }];
    if (req.query.skinCondition) filter.skinConditions = req.query.skinCondition;
    if (req.query.mine === 'true') {
      filter.userId = userId;
      if (req.query.status === 'draft') filter.status = 'draft';
    }
    const before = req.query.before ? new Date(req.query.before) : null;
    if (before && !Number.isNaN(before.getTime())) filter.createdAt = { $lt: before };

    const posts = await Community.find(filter).sort({ createdAt: -1 }).limit(PAGE_SIZE).lean();
    res.json({ posts: posts.map(post => serialize(post, userId)) });
  } catch (error) {
    next(error);
  }
};

exports.get = async (req, res, next) => {
  try {
    const post = await Community.findOne({
      _id: req.params.id,
      $or: [{ status: 'published' }, { status: 'draft', userId: currentUserId(req) }],
    }).lean();
    return post ? res.json({ post: serialize(post, currentUserId(req)) }) : notFound(res);
  } catch (error) {
    next(error);
  }
};

exports.create = async (req, res, next) => {
  try {
    const userId = currentUserId(req);
    const post = await Community.create({
      ...normalizeSkinTypes(req.body, req),
      userId,
      authorName: req.user?.name || undefined,
    });
    res.status(201).json({ post: serialize(post.toObject(), userId) });
  } catch (error) {
    next(error);
  }
};

exports.update = async (req, res, next) => {
  try {
    const userId = currentUserId(req);
    const post = await Community.findOneAndUpdate(
      { _id: req.params.id, userId, status: 'draft' },
      { $set: normalizeSkinTypes(req.body, req) },
      { returnDocument: 'after', runValidators: true }
    ).lean();
    return post ? res.json({ post: serialize(post, userId) }) : notFound(res);
  } catch (error) {
    next(error);
  }
};

exports.remove = async (req, res, next) => {
  try {
    const post = await Community.findOneAndUpdate(
      { _id: req.params.id, userId: currentUserId(req), status: 'published' },
      { status: 'deleted' }
    );
    return post ? res.status(204).send() : notFound(res);
  } catch (error) {
    next(error);
  }
};

// Like/unlike are conditional updates so concurrent taps cannot double count.
exports.toggleLike = async (req, res, next) => {
  try {
    const userId = currentUserId(req);
    const userObjectId = new mongoose.Types.ObjectId(userId);
    const base = { _id: req.params.id, status: 'published' };
    let post = await Community.findOneAndUpdate(
      { ...base, likedBy: { $ne: userObjectId } },
      { $addToSet: { likedBy: userObjectId }, $inc: { likesCount: 1 } },
      { returnDocument: 'after' }
    ).lean();
    if (!post) {
      post = await Community.findOneAndUpdate(
        { ...base, likedBy: userObjectId },
        { $pull: { likedBy: userObjectId }, $inc: { likesCount: -1 } },
        { returnDocument: 'after' }
      ).lean();
    }
    return post ? res.json({ post: serialize(post, userId) }) : notFound(res);
  } catch (error) {
    next(error);
  }
};

// Copy a shared routine into a new RoutinePlan using products already in the
// viewer's collection. We never create fake collection products from a post.
exports.copyRoutine = async (req, res, next) => {
  try {
    const userId = currentUserId(req);
    const post = await Community.findOne({ _id: req.params.id, status: 'published' }).lean();
    if (!post) return notFound(res);
    const days = post.sharedRoutine?.days?.length ? post.sharedRoutine.days : [post.sharedRoutine || {}];
    if (!days.some(day => (day.morning || []).length || (day.evening || []).length)) return res.status(400).json({ error: { message: 'This post has no routine to copy', code: 'EMPTY_ROUTINE' } });

    const activePlan = await RoutinePlan.findOne({ userId, status: 'active' }).select('title currentDay totalDays').lean();
    if (activePlan && req.body?.mode !== 'replace') {
      return res.status(409).json({ error: { message: 'Bạn đang có một chuỗi routine đang chạy.', code: 'ACTIVE_ROUTINE' }, data: { activePlan } });
    }

    const closet = await Collection.find({ userId, status: 'active' }).lean();
    const findClosetProduct = (step) => {
      const stepIngredients = (step.ingredients || []).map(item => String(item).toLowerCase());
      return closet.find(product => product.productName.toLowerCase() === String(step.productName).toLowerCase())
        || closet.find(product => product.productType === step.productType && stepIngredients.length && (product.ingredients || []).some(ingredient => stepIngredients.some(item => String(ingredient).toLowerCase().includes(item))));
    };
    const unresolved = [];
    const mapSteps = (steps) => steps.map(step => {
      const product = findClosetProduct(step);
      if (!product) {
        unresolved.push({ productName: step.productName, productType: step.productType, ingredients: step.ingredients || [] });
        return null;
      }
      return product._id;
    }).filter(Boolean);
    const mappedDays = days.map(day => ({ morningProducts: mapSteps(day.morning || []), eveningProducts: mapSteps(day.evening || []) }));
    if (unresolved.length) {
      return res.status(409).json({ error: { message: 'Một số sản phẩm trong routine không có trong tủ đồ.', code: 'MISSING_ROUTINE_PRODUCTS' }, data: { missingProducts: unresolved } });
    }

    if (activePlan) {
      await RoutinePlan.updateOne({ _id: activePlan._id }, { $set: { status: 'cancelled' } });
      await DailyRoutine.deleteMany({ userId, routinePlanId: activePlan._id });
    }
    const startDate = new Date();
    const dateKey = value => value.toISOString().slice(0, 10);
    const totalDays = mappedDays.length;
    const plan = await RoutinePlan.create({ userId, title: post.title || 'Routine copied from community', startDate: dateKey(startDate), totalDays, source: 'mixed', days: mappedDays.map((day, index) => ({ ...day, dayNumber: index + 1 })) });
    await DailyRoutine.insertMany(mappedDays.map((day, index) => {
      const date = new Date(startDate);
      date.setUTCDate(date.getUTCDate() + index);
      return { userId, routinePlanId: plan._id, routineGroupId: String(plan._id), date: dateKey(date), dayNumber: index + 1, totalDays, ...day };
    }));
    const updated = await Community.findByIdAndUpdate(post._id, { $inc: { copiesCount: 1 } }, { returnDocument: 'after' }).lean();
    res.status(201).json({ copiedCount: mappedDays.length, plan, post: serialize(updated, userId) });
  } catch (error) {
    next(error);
  }
};
