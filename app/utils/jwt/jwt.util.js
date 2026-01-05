/**
 * @file app/utils/jwt/jwt.util.js
 * @description JWT 유틸리티
 * 251216 v1.0.0 Lee init
 */

import jwt from "jsonwebtoken";
import myError from "../../errors/customs/my.error.js";
import {
  EXPIRED_TOKEN_ERROR,
  INVALID_TOKEN_ERROR,
  UNAUTHORIZED_ERROR,
} from "../../../configs/responseCode.config.js";

// -----------------
// private
// -----------------
/**
 * JWT 생성
 * @param {{}} payload
 * @param {number} ttl
 * @returns {string} JWT
 */
function generateToken(payload, ttl) {
  // 옵션 설정
  const options = {
    algorithm: process.env.JWT_ALGORITHM,
    noTimestamp: false, // payload.iat 설정 (토큰 발급 시간 관련 설정)
    expiresIn: ttl, // payload.exp 설정 (토큰 만료 시간) 초단위
    issuer: process.env.JWT_ISSUER, // payload.iss 설정 (토큰 발급자)
  };

  // 토큰 생성
  return jwt.sign(payload, process.env.JWT_SECRET, options);
}

// -----------------
// public
// -----------------
/**
 * 액세스 토큰 생성
 * @param {import("../../models/index.js").User} user
 * @returns {string} JWT
 */
function generateAccessToken(user) {
  // payload 설정        /user agrument: 유저 테이블
  const payload = {
    sub: user.id, // payload.sub set (value: user pk)
    role: user.role, // payload.role set (value: user role)
  };

  // 액세스 토큰 생성
  return generateToken(payload, parseInt(process.env.JWT_ACCESS_TOKEN_EXPIRY));
}

/**
 * 리프레시 토큰 생성
 * @param {import("../../models/index.js").User} user
 * @returns {string} JWT
 */
function generateRefreshToken(user) {
  // payload 설정        /user agrument: 유저 테이블
  const payload = {
    sub: user.id, // payload.sub set (value: user pk)
  };

  // 리프레시 토큰 생성
  return generateToken(payload, parseInt(process.env.JWT_REFRESH_TOKEN_EXPIRY));
}

/**
 * 헤더에서 베어러 토큰 획득
 * @param {import('express').Request} req
 * @returns {string} token
 */
function getBearerToken(req) {
  // Bearer 토큰 획득
  const bearerToken = req.headers[process.env.JWT_HEADER_KEY];

  // Bearer 토큰 미존재
  if (!bearerToken) {
    throw myError("Bearer 토큰 없음", UNAUTHORIZED_ERROR);
  }

  // 베어러토큰 형식 검증
  const tokenParts = bearerToken.split(" ");
  if (tokenParts.length !== 2 || tokenParts[0] !== process.env.JWT_SCHEME) {
    throw myError("베어러 토큰 형식 이상", INVALID_TOKEN_ERROR);
  }
  return tokenParts[1];
}

/**
 *
 * @param {string} token
 * @returns {jwt.Jwt} claims
 */
function getClaimWithVerifyToken(token) {
  try {
    return jwt.verify(token, process.env.JWT_SECRET); // payload (claim) {} 반환
  } catch (error) {
    // 구체적인 에러 원인을 파악하기 위해 로그 추가
    console.error("JWT Verify Error Detail:", {
      message: error.message,
      token: token ? `${token.substring(0, 10)}...` : "null/empty",
    });
    if (error instanceof jwt.TokenExpiredError) {
      throw myError("토큰 만료", EXPIRED_TOKEN_ERROR);
    } else if (error instanceof jwt.JsonWebTokenError) {
      throw myError("토큰 이상 감지", INVALID_TOKEN_ERROR);
    } else {
      throw myError(
        error.message || "알 수 없는 토큰 오류",
        INVALID_TOKEN_ERROR
      );
    }
  }
}

// 내보내기
// generateToken: private이라 export 하지 않음.
export default {
  generateAccessToken,
  generateRefreshToken,
  getBearerToken,
  getClaimWithVerifyToken,
};
