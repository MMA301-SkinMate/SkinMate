const mongoose = require('mongoose');
const CommunityPost = require('../models/CommunityPost');
const TreatmentPlan = require('../models/TreatmentPlan');
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

// Copies the shared routine into the viewer's My Routine as a draft.
exports.copyRoutine = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const post = await CommunityPost.findOne({ _id: req.params.id, status: 'published' }).lean();
    if (!post) return notFound(res);

    const days = post.sharedRoutine?.days?.length ? post.sharedRoutine.days : [post.sharedRoutine || {}];
    const routineDays = days.map((day, dayIndex) => ({
      dayNumber: dayIndex + 1,
      morningSteps: (day.morning || []).map((step, index) => ({
        stepNumber: step.stepNumber || index + 1,
        stepName: step.productType || 'Morning step',
        productType: step.productType || 'treatment',
        productId: null,
        productName: step.productName,
        instruction: step.note || '',
        isExternalSuggestion: true,
      })),
      eveningSteps: (day.evening || []).map((step, index) => ({
        stepNumber: step.stepNumber || index + 1,
        stepName: step.productType || 'Evening step',
        productType: step.productType || 'treatment',
        productId: null,
        productName: step.productName,
        instruction: step.note || '',
        isExternalSuggestion: true,
      })),
    }));

    if (!routineDays.some(day => day.morningSteps.length || day.eveningSteps.length)) {
      return res.status(400).json({ error: { message: 'This post has no routine to copy', code: 'EMPTY_ROUTINE' } });
    }

    const plan = await TreatmentPlan.create({
      userId,
      title: `Cộng đồng · ${post.content || 'Routine được chia sẻ'}`.slice(0, 150),
      goal: 'Routine được sao chép từ Cộng đồng',
      durationDays: routineDays.length,
      status: 'draft',
      isOriginalSuggested: false,
      notes: `Copied from community post ${post._id}`,
    });

    await DailyRoutine.insertMany(routineDays.map(day => ({ ...day, planId: plan._id, userId, isDraft: true })));
    const updated = await CommunityPost.findByIdAndUpdate(post._id, { $inc: { copiesCount: 1 } }, { returnDocument: 'after' }).lean();
    return res.status(201).json({ copiedCount: routineDays.length, plan, post: serialize(updated, userId) });
  } catch (error) {
    next(error);
  }
};
