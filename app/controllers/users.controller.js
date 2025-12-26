/**
 * @file app/controllers/users.controller.js
 * @description 유저 관련 컨트롤러
 * 251216 v1.0.0 Lee init
 */
import usersService from "../services/users.service.js";
import { createBaseResponse } from "../utils/createBaseResponse.util.js";
import { SUCCESS } from "../../configs/responseCode.config.js";
import socialKakaoUtil from "../utils/social/social.kakao.util.js";
import jwtUtil from "../utils/jwt/jwt.util.js";
import cookieUtil from "../utils/cookie/cookie.util.js";

async function kakaoAuthorize(req, res, next) {
  try {
    const kakaoAuthorizeUrl = socialKakaoUtil.getAuthorizeUrl();
    res.redirect(kakaoAuthorizeUrl);
  } catch (err) {
    console.error(err);
    next(err);
  }
}

async function kakaoCallback(req, res, next) {
  const { code } = req.query;
  try {
    // 필수 환경 변수 확인
    const requiredEnvVars = [
      'SOCIAL_KAKAO_API_URL_TOKEN',
      'SOCIAL_KAKAO_REST_API_KEY',
      'APP_URL',
      'SOCIAL_KAKAO_CALLBACK_URL',
      'SOCIAL_KAKAO_API_URL_USER_INFO',
      'SOCIAL_CLIENT_SIGNUP_URL' // 신규 사용자 리다이렉트 URL
    ];

    for (const envVar of requiredEnvVars) {
      if (!process.env[envVar]) {
        throw new Error(`환경 변수 ${envVar}가 설정되지 않았습니다.`);
      }
    }
    
    const tokenResponse = await fetch(process.env.SOCIAL_KAKAO_API_URL_TOKEN, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded;charset=utf-8",
      },
      body: new URLSearchParams({
        grant_type: "authorization_code",
        client_id: process.env.SOCIAL_KAKAO_REST_API_KEY,
        redirect_uri: `${process.env.APP_URL}${process.env.SOCIAL_KAKAO_CALLBACK_URL}`,
        code,
      }),
    });
    const tokenData = await tokenResponse.json();
    if (tokenData.error) throw new Error(tokenData.error_description);

    const userResponse = await fetch(
      process.env.SOCIAL_KAKAO_API_URL_USER_INFO,
      {
        headers: { Authorization: `Bearer ${tokenData.access_token}` },
      }
    );
    const userData = await userResponse.json();

    const user = await usersService.processKakaoUser(userData.id);

    if (user) {
      // 기존 사용자 로그인
      const accessToken = jwtUtil.generateAccessToken(user);
      const refreshToken = jwtUtil.generateRefreshToken(user);
      cookieUtil.setRefreshToken(res, refreshToken);
      return res
        .status(SUCCESS.status)
        .send(createBaseResponse(SUCCESS, { accessToken, user }));
    } else {
      // 신규 사용자, 회원가입 페이지로 리다이렉트
      const { id, kakao_account } = userData;
      const query = new URLSearchParams({
        socialId: id,
        provider: "kakao",
        email: kakao_account.email || "",
        name: kakao_account.profile.nickname || "",
      }).toString();

      // 프론트엔드의 회원가입 페이지로 리다이렉트
      res.redirect(`${process.env.SOCIAL_CLIENT_SIGNUP_URL}?${query}`);
    }
  } catch (err) {
    console.error(err);
    next(err);
  }
}

async function socialSignup(req, res, next) {
  try {
    const { socialId, provider, name, phoneNumber, email } = req.body;
    const newUser = await usersService.createSocialUser(
      socialId,
      provider,
      name,
      phoneNumber,
      email
    );

    // 회원가입 후 바로 로그인
    const accessToken = jwtUtil.generateAccessToken(newUser);
    const refreshToken = jwtUtil.generateRefreshToken(newUser);
    cookieUtil.setRefreshToken(res, refreshToken);

    return res
      .status(SUCCESS.status)
      .send(createBaseResponse(SUCCESS, { accessToken, user: newUser }));
  } catch (err) {
    console.error(err);
    if (err.status) {
      return res.status(err.status).send(createBaseResponse(err));
    }
    next(err);
  }
}

export default { socialSignup, kakaoAuthorize, kakaoCallback };
