/**
 * @file app.js
 * @description Express 앱 초기화 및 미들웨어 설정
 * 260110 v1.0.1 Lee update: Global Error Handler 통합
 */
import "./configs/env.config.js"; // 환경변수 설정 파일 임포트
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import swaggerUi from "swagger-ui-express";
import swaggerJsdoc from "swagger-jsdoc";
import swaggerOptions from "./configs/swagger.config.js";

// 라우터 임포트
import usersRouter from "./routes/users.router.js";
import authRouter from "./routes/auth.router.js";
import reviewsRouter from "./routes/reviews.router.js";
import businessesRouter from "./routes/businesses.router.js";
import icemachinesRouter from "./routes/icemachines.router.js";
import reservationsRouter from "./routes/reservations.router.js";
import adminRouter from "./routes/admin.router.js";
import servicePoliciesRouter from "./routes/servicePolicies.route.js";
import userAdminRouter from "./routes/user.admin.router.js";
import engineerAdminRouter from "./routes/engineer.admin.router.js";

// 에러 핸들러 임포트
import engineersRouter from "./routes/engineers.router.js";
import errorHandler from "./app/errors/errorHandler.js";
import subscriptionRouter from "./routes/subscription.router.js";
import corsMiddleware from "./app/middlewares/cors/cors.middleware.js";

const app = express();
const port = process.env.PORT || 3000;

// 미들웨어 설정
app.use(corsMiddleware);
app.use(cookieParser()); // cookie-parser 미들웨어 등록
app.use(express.json()); // JSON 형태의 요청 body를 파싱하기 위함
app.use(express.urlencoded({ extended: false })); // form-urlencoded 형태의 요청 body를 파싱하기 위함

// 요청 로거 (개발 단계용)
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
  next();
});

// 정적 파일 제공
app.use(
  process.env.FILE_STATIC_PATH_REVIEW,
  express.static(process.env.FILE_STORAGE_PATH_REVIEW)
);

// Swagger UI 설정
const specs = swaggerJsdoc(swaggerOptions);
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(specs));

// 간단한 기본 라우트
// app.get("/", (req, res) => {
//   res.send("Server is running!");
// });

// --- API 라우터 등록 ---
app.use("/api/users", usersRouter);
app.use("/api/engineers", engineersRouter); // 기사 라우터 등록
app.use("/api/auth", authRouter);
app.use("/api/reviews", reviewsRouter);
app.use("/api/businesses", businessesRouter);
app.use("/api/icemachines", icemachinesRouter);
app.use("/api/reservations", reservationsRouter);
app.use("/api/admin", adminRouter);
app.use("/api/admin/users", userAdminRouter);
app.use("/api/service-policies", servicePoliciesRouter);
app.use("/api/admin/engineers", engineerAdminRouter);
app.use("/api/subscriptions", subscriptionRouter);
// 🚩 [핵심] 에러 핸들러는 반드시 모든 라우터 설정 뒤에 위치해야 합니다.
// 컨트롤러에서 next(err)가 호출되면 최종적으로 여기서 응답을 처리합니다.
app.use(errorHandler);

app.listen(port, () => {
  console.log(`✅ Server is listening on port ${port}`);
});

export default app; // 테스트 등을 위해 export 추가
