/**
 * @file app/controllers/users.controller.js
 * @description 유저 관련 컨트롤러
 * 251216 v1.0.0 Lee init
 */
import { URL } from "url";
import usersService from "../services/users.service.js";
import authService from "../services/auth.service.js";
import { createBaseResponse } from "../utils/createBaseResponse.util.js";
import { SUCCESS, REISSUE_ERROR } from "../../configs/responseCode.config.js";
import socialKakaoUtil from "../utils/social/social.kakao.util.js";
import jwtUtil from "../utils/jwt/jwt.util.js";
import cookieUtil from "../utils/cookie/cookie.util.js";
import myError from "../errors/customs/my.error.js";

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
      const { refreshToken } = await authService.loginUser(user);
      cookieUtil.setCookieRefreshToken(res, refreshToken);
      const homeUrl = process.env.SOCIAL_CLIENT_CALLBACK_URL;
      return res.redirect(homeUrl);
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
    const { refreshToken } = await authService.createAndLoginSocialUser(
      socialId,
      provider,
      name,
      phoneNumber,
      email
    );

    cookieUtil.setCookieRefreshToken(res, refreshToken);

    return res.redirect(process.env.CLIENT_REGISTER_BUSINESS_URL);
  } catch (err) {
    console.error(err);
    if (err.status) {
      return res.status(err.status).send(createBaseResponse(err));
    }
    next(err);
  }
}

async function reissue(req, res, next) {
  console.log(req.cookies);
  try {
    const token = cookieUtil.getCookieRefreshToken(req);

    // 토큰 존재 여부 확인
    if (!token) {
      throw myError("리프래시 토큰 없음", REISSUE_ERROR);
    }

    // 토큰 재발급 처리
    const { accessToken, refreshToken, user } = await authService.reissue(
      token
    );

    // 쿠키에 refresh token 설정
    cookieUtil.setCookieRefreshToken(res, refreshToken);

    return res
      .status(SUCCESS.status)
      .send(createBaseResponse(SUCCESS, { accessToken, user }));
  } catch (error) {
    next(error);
  }
}

/**
 * 내 정보 조회
 */
async function getMe(req, res, next) {
  try {
    // 로그인 전 테스트용
    const userId = req.user.id; // TODO: 로그인 완성되면 이코드로 변경
    // const userId = 3; // TODO: 로그인 완성되면 삭제

    const user = await usersService.getMe(userId);

    return res
      .status(SUCCESS.status)
      .send(createBaseResponse(SUCCESS, user));
  } catch (error) {
    next(error);
  }
};

/**
 * 내 정보 수정
 */
const updateMe = async (req, res, next) => {
  try {
    // 로그인 전 테스트용
    const userId = req.user.id; // TODO: 로그인 완성되면 이코드로 변경
    // const userId = 3; // TODO: 로그인 완성되면 삭제

    const updateDto = {
      name: req.body?.name,
      email: req.body?.email,
      phoneNumber: req.body?.phoneNumber,
    };

    const updatedUser = await usersService.updateMe(userId, updateDto);

    return res
      .status(SUCCESS.status)
      .send(createBaseResponse(SUCCESS, updatedUser));
  } catch (error) {
    next(error);
  }
};

const checkEmailDuplicate = async (req, res, next) => {
  try {
    const { email } = req.query;

    const exists = await usersService.checkEmailDuplicate(email);

    return res
      .status(SUCCESS.status)
      .send(createBaseResponse(SUCCESS, exists));
  } catch (error) {
    next(error);
  }
};

const withdrawMe = async (req, res) => {
  try {
    // 로그인 전 테스트용
    const userId = req.user.id; // TODO: 로그인 완성되면 이코드로 변경
    // const userId = 3; // TODO: 로그인 완성되면 삭제

    await usersService.withdrawUser(userId);

    return res.status(200).json({
      message: "회원 탈퇴가 완료되었습니다.",
    });
  } catch (error) {
    return res.status(400).json({
      message: error.message,
    });
  }
};

export default {
  socialSignup,
  kakaoAuthorize,
  kakaoCallback,
  reissue,
  getMe,
  updateMe,
  checkEmailDuplicate,
  withdrawMe,
};
