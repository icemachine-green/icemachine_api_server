/**
 * @file configs/swagger.config.js
 * @description Swagger JSDoc 설정
 * 251229 v1.0.0 Lee init
 */

const swaggerDefinition = {
  openapi: '3.0.0',
  info: {
    title: 'Ice Machine Service API',
    version: '1.0.0',
    description: '얼음 제빙기 서비스의 API 명세서입니다.',
  },
  servers: [
    {
      url: 'http://localhost:3000',
      description: '개발 서버',
    },
  ],
  // 인증을 위한 BearerAuth 설정
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
      },
    },
  },
  security: [
    {
      bearerAuth: [],
    },
  ],
};

const options = {
  swaggerDefinition,
  // API 주석이 포함된 파일 경로
  apis: ['./routes/*.js'], // routes 폴더 내의 모든 .js 파일을 대상으로 함
};

export default options;
