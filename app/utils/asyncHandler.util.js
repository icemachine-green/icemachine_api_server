/**
 * @file asyncHandler.util.js
 * @description 컨트롤러의 비동기 에러를 catch하여 next(err)로 전달
 */
export const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};
