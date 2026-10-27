const communityService = require('../services/communityService');

exports.listPosts = async (req, res, next) => {
  try {
    const posts = await communityService.listPosts();
    return res.status(200).json({ success: true, data: posts });
  } catch (error) {
    next(error);
  }
};
