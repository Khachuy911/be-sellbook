const Comment = require('../model/commentModel');
const { getPagination, getSort, filter, search } = require('../helper/helper');
const { DEFAULT_VALUE, MESSAGE, HTTP_CODE } = require('../helper/constant');
const ErrorResponse = require('../helper/errorResponse');

module.exports = {
  create: async (req, res, next) => {
    const { text, productId } = req.body;
    if (!text || !productId) {
      return next(new ErrorResponse(HTTP_CODE.BAD_REQUEST, MESSAGE.INFOR_LACK));
    }

    const userId = req.user;

    const data = {
      text,
      userId,
      productId
    }

    const comment = new Comment(data);

    await comment.save()

    res.status(HTTP_CODE.CREATED).json({
      isSuccess: true,
      message: MESSAGE.CREATED,
      data: null
    })
  },

  getComment: async (req, res, next) => {
    const condition = {
      where: {
        isDeleted: DEFAULT_VALUE.IS_NOT_DELETED,
        ...filter('userId', req.query.userId)
      },
      ...getPagination(req.query.page),
      ...getSort(req.query.title, req.query.type)
    }

    const comment = await Comment.findAndCountAll(condition);

    const pageSize = req.query.pageSize || process.env.DEFAULT_LIMIT_PAGE;
    const data = {
      pageSize,
      pageIndex: req.query.page || process.env.DEFAULT_PAGE,
      totalPage: Math.ceil(comment.count / +pageSize),
      totalSize: comment.rows.length || 0,
      rows: comment.rows
    }

    res.status(HTTP_CODE.SUCCESS).json({
      isSuccess: true,
      message: MESSAGE.SUCCESS,
      data
    })
  },

  getDetail: async (req, res, next) => {
    const { id } = req.params;

    const condition = {
      where: {
        id: id,
        isDeleted: DEFAULT_VALUE.IS_NOT_DELETED,
      }
    }
    const comment = await Comment.findOne(condition);

    res.status(HTTP_CODE.SUCCESS).json({
      isSuccess: true,
      message: MESSAGE.SUCCESS,
      data: comment
    })
  },

  update: async (req, res, next) => {
    try {
      const { id } = req.params;

      if (!id) {
        return next(new ErrorResponse(HTTP_CODE.BAD_REQUEST, MESSAGE.BAD_REQUEST))
      }

      const condition = {
        where: {
          id,
          isDeleted: DEFAULT_VALUE.IS_NOT_DELETED,
        }
      }

      const { text } = req.body;

      const data = {
        text
      }

      await Comment.update(data, condition);

      res.status(HTTP_CODE.SUCCESS).json({
        isSuccess: true,
        message: MESSAGE.SUCCESS,
        data: null,
      })

    } catch (error) {
      return next(new ErrorResponse(HTTP_CODE.BAD_REQUEST, error.message));
    }
  },

  deleteSoft: async (req, res, next) => {
    try {
      const { id } = req.params;
      if (!id) {
        return next(new ErrorResponse(HTTP_CODE.BAD_REQUEST, MESSAGE.BAD_REQUEST));
      }

      const condition = {
        where: {
          id,
          isDeleted: DEFAULT_VALUE.IS_NOT_DELETED,
        }
      };

      const data = {
        isDeleted: DEFAULT_VALUE.IS_DELETED
      }

      await Comment.update(data, condition);

      res.status(HTTP_CODE.SUCCESS).json({
        isSuccess: true,
        message: MESSAGE.SUCCESS,
        data: null
      })
    } catch (error) {
      return next(new ErrorResponse(HTTP_CODE.BAD_REQUEST, error.message))
    }
  }
}