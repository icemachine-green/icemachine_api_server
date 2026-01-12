/**
 * @file app/middlewares/cors/cors.middleware.js
 * @description cors Middleware
 * 260112 pbj init
 */

import cors from 'cors';
import myError from '../../errors/customs/my.error.js';
import { FORBIDDEN_ERROR } from '../../../configs/responseCode.config.js';

const allowedOrigins = [
  'https://app5.green-meerkat.kro.kr',
  'https://app6.green-meerkat.kro.kr',
  'https://app7.green-meerkat.kro.kr',
];

export default cors({
  origin: function (origin, callback) {
    // 허용된 목록에 있거나, dev 모드이면 허용
    if (allowedOrigins.indexOf(origin) !== -1 || process.env.APP_MODE === 'development') {
      callback(null, true); // 허용
    } else {
      callback(myError('Not allowed by CORS', FORBIDDEN_ERROR)); // 거부
    }
  },
  credentials: true,
});