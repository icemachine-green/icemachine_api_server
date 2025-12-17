/**
 * @file app.js
 * @description Express 앱 초기화
 * 251216 v1.0.0 Lee init
 */
import express from "express";
import cors from "cors";
import dotenv from "dotenv"; // 환경 변수 한번에 불러오기
import usersRouter from "./routes/users.router.js"; // 사용자 라우터 import
import servicesRouter from "./routes/services.router.js"; // 서비스 라우터 import

// .env 파일로부터 환경 변수를 불러옵니다.
dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

// 미들웨어 설정
app.use(cors()); // CORS 허용
app.use(express.json()); // JSON 형태의 요청 body를 파싱하기 위함
app.use(express.urlencoded({ extended: false })); // form-urlencoded 형태의 요청 body를 파싱하기 위함

// 간단한 기본 라우트
app.get("/", (req, res) => {
  res.send("Server is running!");
});

// API 라우터 등록
app.use("/api/users", usersRouter);
app.use("/api/services", servicesRouter);

app.listen(port, () => {
  console.log(`Server is listening on port ${port}`);
});
