const mongoose = require('mongoose');
const CommunityPost = require('../models/CommunityPost');
const Collection = require('../models/Collection');
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
  images: post.images || [],
  tags: post.tags || [],
  skinType: post.skinType,
  skinTypes: getSkinTypes(post),
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
      const result = await uploadToCloudinary(file);
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
    if (req.query.mine === 'true') {
      filter.userId = userId;
      if (req.query.status === 'draft') filter.status = 'draft';
    }
    const before = req.query.before ? new Date(req.query.before) : null;
    if (before && !Number.isNaN(before.getTime())) filter.createdAt = { $lt: before };

    const posts = await CommunityPost.find(filter).sort({ createdAt: -1 }).limit(PAGE_SIZE).lean();
    res.json({ posts: posts.map(post => serialize(post, userId)) });
  } catch (error) {
    next(error);
  }
};

exports.get = async (req, res, next) => {
  try {
    const post = await CommunityPost.findOne({
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
    const post = await CommunityPost.create({
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
    const post = await CommunityPost.findOneAndUpdate(
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
    const post = await CommunityPost.findOneAndUpdate(
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
    let post = await CommunityPost.findOneAndUpdate(
      { ...base, likedBy: { $ne: userObjectId } },
      { $addToSet: { likedBy: userObjectId }, $inc: { likesCount: 1 } },
      { returnDocument: 'after' }
    ).lean();
    if (!post) {
      post = await CommunityPost.findOneAndUpdate(
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

// Copies the shared routine into the viewer's collection. Products are created
// as active because draft collection items expire through a TTL index.
exports.copyRoutine = async (req, res, next) => {
  try {
    const userId = currentUserId(req);
    const post = await CommunityPost.findOne({ _id: req.params.id, status: 'published' }).lean();
    if (!post) return notFound(res);

    const toProducts = (steps, slot) => steps.map((step, index) => ({
      userId,
      productName: step.productName,
      productType: step.productType,
      productIcon: step.productIcon || undefined,
      note: step.note || null,
      status: 'active',
      routineUsage: { morning: slot === 'morning', evening: slot === 'evening', step: index + 1 },
    }));
    const days = post.sharedRoutine?.days?.length ? post.sharedRoutine.days : [post.sharedRoutine || {}];
    const products = days.flatMap((day, dayIndex) => [
      ...toProducts(day.morning || [], 'morning'),
      ...toProducts(day.evening || [], 'evening'),
    ].map(product => ({ ...product, note: days.length > 1 ? `Ngày ${dayIndex + 1}: ${product.note || ''}`.trim() : product.note })));
    if (!products.length) return res.status(400).json({ error: { message: 'This post has no routine to copy', code: 'EMPTY_ROUTINE' } });

    const created = await Collection.insertMany(products);
    const updated = await CommunityPost.findByIdAndUpdate(post._id, { $inc: { copiesCount: 1 } }, { returnDocument: 'after' }).lean();
    res.status(201).json({ copiedCount: created.length, post: serialize(updated, userId) });
  } catch (error) {
    next(error);
  }
};
