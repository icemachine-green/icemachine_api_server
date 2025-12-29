/**
 * @file app.js
 * @description Express 앱 초기화
 * 251216 v1.0.0 Lee init
 */
import "./configs/env.config.js"; // 환경변수 설정 파일 임포트
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser"; // cookie-parser import
import usersRouter from "./routes/users.router.js"; // 사용자 라우터 import
import authRouter from "./routes/auth.router.js"; // 인증 라우터 import

const app = express();
const port = process.env.PORT;

// 미들웨어 설정
app.use(cors({
  origin: process.env.CLIENT_FRONTEND_URL, // 프론트엔드 주소
  credentials: true // 자격 증명(쿠키 등) 허용
}));
app.use(cookieParser()); // cookie-parser 미들웨어 등록
app.use(express.json()); // JSON 형태의 요청 body를 파싱하기 위함
app.use(express.urlencoded({ extended: false })); // form-urlencoded 형태의 요청 body를 파싱하기 위함

// --- 요청 로거 미들웨어 추가 ---
app.use((req, res, next) => {
  console.log(`[Request Logger] Method: ${req.method}, URL: ${req.originalUrl}`);
  next();
});
// -----------------------------

// 간단한 기본 라우트
app.get("/", (req, res) => {
  res.send("Server is running!");
});

// API 라우터 등록
app.use("/api/users", usersRouter);
app.use("/api/auth", authRouter); // 인증 라우터 등록

app.listen(port, () => {
  console.log(`Server is listening on port ${port}`);
});
