/**
 * @file app/controllers/users.controller.js
 * @description 유저 관련 컨트롤러
 * 251216 v1.0.0 Lee init
 * 260107 v1.1.0 Gemini-Refactor: state 기반 동적 리다이렉트 적용
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
    // 프론트에서 넘어온 :client 값을 카카오의 state 파라미터로 전달
    const kakaoAuthorizeUrl = socialKakaoUtil.getAuthorizeUrl(
      req.params.client
    );
    res.redirect(kakaoAuthorizeUrl);
  } catch (err) {
    console.error(err);
    next(err);
  }
}

async function kakaoCallback(req, res, next) {
  const { code, state } = req.query; // 프론트에서 넘겼던 client 또는 engineer 값이 들어옴

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

    // [변경 포인트 1] state 값에 따른 리다이렉트 주소 분기 처리 (env 변수명 적용)
    // 고객(client)이면 SOCIAL_CLIENT_CALLBACK_URL, 기사(engineer)면 SOCIAL_ENGINEER_CALLBACK_URL 사용
    const domain =
      state === "engineer"
        ? process.env.SOCIAL_ENGINEER_URL
        : process.env.SOCIAL_CLIENT_URL;

    if (user) {
      // 기존 사용자 로그인
      const { refreshToken } = await authService.loginUser(user);
      cookieUtil.setCookieRefreshToken(res, refreshToken);

      // [변경 포인트 2] 결정된 주소로 리다이렉트
      return res.redirect(`${domain}${process.env.SOCIAL_LOGIN_CALLBACK_URL}`);
    } else {
      // 신규 사용자
      const { id, kakao_account } = userData;
      const query = new URLSearchParams({
        socialId: id,
        provider: "kakao",
        email: kakao_account.email || "",
        name: kakao_account.profile.nickname || "",
        role: state, // 회원가입 페이지에 누가 가입하려 하는지 정보 전달
      }).toString();

      // [변경 포인트 3] 회원가입 페이지 리다이렉트 (필요 시 기사용 signup URL env 추가 권장)
      // 현재 env 기준으로는 SOCIAL_CLIENT_SIGNUP_URL을 기본으로 사용합니다.
      return res.redirect(`${domain}${process.env.SOCIAL_SIGNUP_URL}?${query}`);
    }
  } catch (err) {
    console.error(err);
    next(err);
  }
}

async function socialSignup(req, res, next) {
  try {
    // [변경 포인트 4] 프론트에서 가입 요청 시 보낸 role(state) 정보 활용
    const { socialId, provider, name, phoneNumber, email, role } = req.body;
    const { refreshToken } = await authService.createAndLoginSocialUser(
      socialId,
      provider,
      name,
      phoneNumber,
      email
    );

    cookieUtil.setCookieRefreshToken(res, refreshToken);

    // [변경 포인트 5] 가입 완료 후 리다이렉트 주소 분기
    const completionUrl =
      role === "engineer"
        ? process.env.SOCIAL_ENGINEER_CALLBACK_URL
        : process.env.CLIENT_REGISTER_BUSINESS_URL;

    // POST 요청이므로 URL을 응답 바디에 담아 보내 프론트에서 이동시키도록 처리
    return res
      .status(SUCCESS.status)
      .send(createBaseResponse(SUCCESS, { redirectUrl: completionUrl }));
  } catch (err) {
    console.error(err);
    if (err.status) {
      return res.status(err.status).send(createBaseResponse(err));
    }
    next(err);
  }
}

async function reissue(req, res, next) {
  try {
    const token = cookieUtil.getCookieRefreshToken(req);
    if (!token) {
      throw myError("리프래시 토큰 없음", REISSUE_ERROR);
    }

    const { accessToken, refreshToken, user } = await authService.reissue(
      token
    );
    cookieUtil.setCookieRefreshToken(res, refreshToken);

    return res
      .status(SUCCESS.status)
      .send(createBaseResponse(SUCCESS, { accessToken, user }));
  } catch (error) {
    next(error);
  }
}

async function getMe(req, res, next) {
  try {
    const userId = req.user.id;
    const user = await usersService.getMe(userId);
    return res.status(SUCCESS.status).send(createBaseResponse(SUCCESS, user));
  } catch (error) {
    next(error);
  }
}

const updateMe = async (req, res, next) => {
  try {
    const userId = req.user.id;
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
    if (error.status) {
      return res.status(error.status).send(createBaseResponse(error));
    }
    next(error);
  }
};

const checkEmailDuplicate = async (req, res, next) => {
  try {
    const { email } = req.query;
    const exists = await usersService.checkEmailDuplicate(email);
    return res.status(SUCCESS.status).send(createBaseResponse(SUCCESS, exists));
  } catch (error) {
    next(error);
  }
};

const withdrawMe = async (req, res) => {
  try {
    const userId = req.user.id;
    await usersService.withdrawUser(userId);
    return res
      .status(SUCCESS.status)
      .json(
        createBaseResponse(SUCCESS, { message: "회원 탈퇴가 완료되었습니다." })
      );
  } catch (error) {
    return next(error);
  }
};

const logout = async (req, res, nex) => {
  try {
    await usersService.logout(req.user.id);

    cookieUtil.clearCookieRefreshToken(res);

    return res.status(SUCCESS.status).json(createBaseResponse(SUCCESS));
  } catch (error) {
    return next(error);
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
  logout,
};
