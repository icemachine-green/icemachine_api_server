/**
 * @file app/services/users.service.js
 * @description 유저 인증 관련 서비스: 로그인, 회원가입, 토큰 재발급
 * 251224 v1.0.0 Lee init
 */
import usersRepository from "../repositories/users.repository.js";
import jwtUtil from "../utils/jwt/jwt.util.js";
import myError from "../errors/customs/my.error.js";
import {
  REISSUE_ERROR,
  CONFLICT_ERROR,
} from "../../configs/responseCode.config.js";

const reissue = async (token) => {
  // 1. 토큰 검증 및 클레임 획득
  const claims = jwtUtil.getClaimWithVerifyToken(token);

  // 2. DB에서 리프레시 토큰으로 사용자 조회
  const user = await usersRepository.findUserByRefreshToken(token);

  // 3. 사용자가 없거나, 토큰의 사용자 ID와 조회된 사용자 ID가 다를 경우 에러
  if (!user || user.id !== claims.sub) {
    throw myError("유효하지 않은 리프레시 토큰입니다.", REISSUE_ERROR);
  }

  // 4. 새로운 토큰 생성 (Refresh Token Rotation)
  const newAccessToken = jwtUtil.generateAccessToken(user);
  const newRefreshToken = jwtUtil.generateRefreshToken(user);

  // 5. 새로 생성된 리프레시 토큰을 DB에 저장
  user.refreshToken = newRefreshToken;
  await usersRepository.save(user);

  return {
    accessToken: newAccessToken,
    refreshToken: newRefreshToken,
    user,
  };
};

const loginUser = async (user) => {
  const accessToken = jwtUtil.generateAccessToken(user);
  const refreshToken = jwtUtil.generateRefreshToken(user);

  user.refreshToken = refreshToken;
  await usersRepository.save(user);

  return { accessToken, refreshToken };
};

const createAndLoginSocialUser = async (
  socialId,
  provider,
  name,
  phoneNumber,
  email
) => {
  // 이메일 중복 확인
  const existingUser = await usersRepository.findUserByEmail(email);
  if (existingUser) {
    throw { ...CONFLICT_ERROR, info: "이미 존재하는 이메일입니다." };
  }

  // 리프레시 토큰 없이 사용자 우선 생성
  const newUser = await usersRepository.createUser({
    socialId,
    provider,
    name,
    phoneNumber,
    email,
    role: "customer",
  });

  // 생성된 newUser 객체로 토큰 생성
  const accessToken = jwtUtil.generateAccessToken(newUser);
  const refreshToken = jwtUtil.generateRefreshToken(newUser);

  // 생성된 리프레시 토큰을 DB에 업데이트
  newUser.refreshToken = refreshToken;
  await usersRepository.save(newUser);

  // 모든 정보 반환
  return {
    accessToken,
    refreshToken,
    user: newUser,
  };
};

export default { reissue, loginUser, createAndLoginSocialUser };
