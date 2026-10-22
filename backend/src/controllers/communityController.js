const CommunityPost = require('../models/CommunityPost');
const routineService = require('../services/routineService');
const { createPostSchema, reportPostSchema } = require('../validations/postDto');

const getPosts = async (req, res, next) => {
  try {
    const { skinType, sort = 'popular', page = 1, limit = 10 } = req.query;
    const query = { isHidden: false };

    if (skinType && skinType !== 'all') {
      query.skinType = skinType;
    }

    const sortOption =
      sort === 'latest' ? { createdAt: -1 } : { likesCount: -1, createdAt: -1 };

    const skip = (Number(page) - 1) * Number(limit);

    const posts = await CommunityPost.find(query)
      .sort(sortOption)
      .skip(skip)
      .limit(Number(limit))
      .populate('author', 'name avatar skinType');

    const total = await CommunityPost.countDocuments(query);

    return res.status(200).json({
      success: true,
      total,
      page: Number(page),
      data: posts,
    });
  } catch (error) {
    next(error);
  }
};

const getPostDetail = async (req, res, next) => {
  try {
    const post = await CommunityPost.findById(req.params.id).populate(
      'author',
      'name avatar skinType'
    );
    if (!post || post.isHidden) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy bài viết hoặc bài viết đã bị ẩn',
      });
    }

    return res.status(200).json({
      success: true,
      data: post,
    });
  } catch (error) {
    next(error);
  }
};

const createPost = async (req, res, next) => {
  try {
    const { error, value } = createPostSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        message: error.details[0].message,
      });
    }

    const newPost = await CommunityPost.create({
      ...value,
      author: req.user._id,
      skinType: value.skinType || req.user.skinType,
    });

    const populated = await CommunityPost.findById(newPost._id).populate(
      'author',
      'name avatar skinType'
    );

    return res.status(201).json({
      success: true,
      message: 'Chia sẻ bài viết lên cộng đồng thành công!',
      data: populated,
    });
  } catch (error) {
    next(error);
  }
};

const toggleLikePost = async (req, res, next) => {
  try {
    const post = await CommunityPost.findById(req.params.id);
    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy bài viết',
      });
    }

    const userIdStr = req.user._id.toString();
    const existingIndex = post.likes.findIndex(
      (id) => id.toString() === userIdStr
    );

    if (existingIndex > -1) {
      // Unlike
      post.likes.splice(existingIndex, 1);
    } else {
      // Like
      post.likes.push(req.user._id);
    }

    post.likesCount = post.likes.length;
    await post.save();

    return res.status(200).json({
      success: true,
      isLiked: existingIndex === -1,
      likesCount: post.likesCount,
    });
  } catch (error) {
    next(error);
  }
};

const copyPostRoutine = async (req, res, next) => {
  try {
    const post = await CommunityPost.findById(req.params.id);
    if (!post || !post.routineData) {
      return res.status(400).json({
        success: false,
        message: 'Bài viết này không đính kèm chuỗi routine để sao chép',
      });
    }

    const result = await routineService.copyRoutineChain(
      req.user._id,
      post.routineData
    );

    // Tăng số lượt copy của bài viết
    post.copiesCount = (post.copiesCount || 0) + 1;
    await post.save();

    return res.status(201).json({
      success: true,
      message: 'Đã sao chép chuỗi routine từ bài đăng vào phác đồ của bạn!',
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

const reportPost = async (req, res, next) => {
  try {
    const { error, value } = reportPostSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        message: error.details[0].message,
      });
    }

    const post = await CommunityPost.findById(req.params.id);
    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy bài viết',
      });
    }

    post.addReport(req.user._id, value.reason);
    await post.save();

    return res.status(200).json({
      success: true,
      message: 'Cảm ơn bạn đã gửi báo cáo. Ban quản trị sẽ rà soát nội dung này.',
      isHidden: post.isHidden,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getPosts,
  getPostDetail,
  createPost,
  toggleLikePost,
  copyPostRoutine,
  reportPost,
};
