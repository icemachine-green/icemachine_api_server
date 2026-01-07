/**
 * @file app/controllers/engineers.controller.js
 * @description 기사 관련 컨트롤러
 * 260106 v1.0.0 Jung init
 */

import engineersService from "../services/engineers.service.js";
import axios from 'axios';

// 카카오 로그인 시작 (카카오 인증 페이지로 리디렉션)
async function kakaoAuthorize(req, res) {
  const authorizeUrl = engineersService.getKakaoAuthorizeUrl();
  res.redirect(authorizeUrl);
}

// 카카오 로그인 콜백 처리
async function kakaoCallback(req, res, next) {
  const { code } = req.query;

  try {
    const tokenResponse = await axios.post(process.env.SOCIAL_KAKAO_API_URL_TOKEN, new URLSearchParams({
      grant_type: 'authorization_code',
      client_id: process.env.SOCIAL_KAKAO_REST_API_KEY,
      redirect_uri: process.env.ENGINEER_KAKAO_REDIRECT_URI,
      code,
    }).toString(), {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8' }
    });

    const tokenData = tokenResponse.data;
    if (tokenData.error) throw new Error(tokenData.error_description);

    const userResponse = await axios.get(process.env.SOCIAL_KAKAO_API_URL_USER_INFO, {
      headers: { Authorization: `Bearer ${tokenData.access_token}` }
    });
    const userData = userResponse.data;

    const user = await engineersService.processKakaoEngineer(userData.id);

    if (user) {
      // 기존 엔지니어 로그인
      const { accessToken, refreshToken } = await engineersService.loginEngineer(user);
      res.cookie('accessToken', `Bearer ${accessToken}`, { httpOnly: true, sameSite: 'lax', secure: process.env.NODE_ENV === 'production' });
      res.cookie('refreshToken', `Bearer ${refreshToken}`, { httpOnly: true, sameSite: 'lax', secure: process.env.NODE_ENV === 'production' });
      res.redirect(process.env.ENGINEER_FRONTEND_URL); // 엔지니어 홈으로 리다이렉트
    } else {
    // 신규 엔지니어, 회원가입 페이지로 리다이렉트
      const { id, kakao_account } = userData;
      const query = new URLSearchParams({
        socialId: id,
        provider: "kakao",
        email: kakao_account.email || "",
        name: kakao_account.profile.nickname || "",
      }).toString();

      res.redirect(`${process.env.ENGINEER_FRONTEND_URL}/signup?${query}`);
    }
  } catch (err) {
    console.error(err);
    next(err);
  }
}

// 최종 회원가입 (신규 함수)
async function socialSignup(req, res, next) {
  try {
    const { socialId, provider, name, phoneNumber, email } = req.body;
    const { accessToken, refreshToken } = await engineersService.createAndLoginEngineer(
      socialId,
      provider,
      name,
      phoneNumber,
      email
    );

    res.cookie('accessToken', `Bearer ${accessToken}`, { httpOnly: true, sameSite: 'lax', secure: process.env.NODE_ENV === 'production' });
    res.cookie('refreshToken', `Bearer ${refreshToken}`, { httpOnly: true, sameSite: 'lax', secure: process.env.NODE_ENV === 'production' });

    res.status(201).json({ message: "회원가입 및 로그인에 성공했습니다." });
  } catch (err) {
    console.error(err);
    next(err);
  }
}

// 토큰 재발급
async function reissue(req, res, next) {
  try {
    const { refreshToken } = req.cookies;
    const { newAccessToken, newRefreshToken } = await engineersService.
    reissueToken(refreshToken);

    res.cookie('accessToken', `Bearer ${newAccessToken}`, { httpOnly: true,
      sameSite: 'lax', secure: process.env.NODE_ENV === 'production' });
    if (newRefreshToken) {
      res.cookie('refreshToken', `Bearer ${newRefreshToken}`, { httpOnly: true, 
        sameSite: 'lax', secure: process.env.NODE_ENV === 'production' });
    }

    return res.status(200).json({ message: "토큰이 성공적으로 재발급되었습니다." });
  } catch (error) {
    console.error(error);
    next(error);
  }
}

async function getDashboard(req, res, next) {
  try {
    // const userId = req.user.id; // users.id임
    const userId = 1034; // TODO: auth 적용 후 req.user.id로 바꿔야함
    const data = await engineersService.getDashboard(userId);
    res.status(200).json(data);
  } catch (err) {
    console.error(err);
    next(err);
  }
};

// 기사 - 날짜별 예약 조회
async function getMyReservations(req, res, next) {
  try {
    // const userId = req.user.id;
    const userId = 1034; // TODO: auth 적용 후 req.user.id로 바꿔야함
    const { date } = req.query;

    if (!date) {
      throw new Error("DATE_REQUIRED");
    }

    const reservations =
      await engineersService.getDailyReservations(
        userId,
        date
      );

    res.status(200).json({
      date,
      reservations,
    });
  } catch (err) {
    console.error(err);
    next(err);
  }
};

// 예약 상세 조회
async function getReservationDetail(req, res, next) {
  try {
    // const userId = req.user.id;
    const userId = 1034; // TODO: auth 적용 후 req.user.id로 바꿔야함
    const { reservationId } = req.params;

    const reservation =
      await engineersService.getReservationDetail(
        userId,
        reservationId
      );

    res.status(200).json(reservation);
  } catch (err) {
    next(err);
  }
}

async function startWork(req, res, next) {
  try {
    // const userId = req.user.id;
    const userId = 1034; // TODO: auth 적용 후 req.user.id로 바꿔야함
    const { reservationId } = req.params;

    await engineersService.startWork(userId, reservationId);

    res.status(200).json({ message: "WORK_STARTED" });
  } catch (err) {
    next(err);
  }
}

async function completeWork(req, res, next) {
  try {
    // const userId = req.user.id;
    const userId = 1034; // TODO: auth 적용 후 req.user.id로 바꿔야함
    const { reservationId } = req.params;

    await engineersService.completeWork(userId, reservationId);

    res.status(200).json({ message: "WORK_COMPLETED" });
  } catch (err) {
    next(err);
  }
}

async function cancelWork(req, res, next) {
  try {
    // const userId = req.user.id;
    const userId = 1034; // TODO: auth 적용 후 req.user.id로 바꿔야함
    const { reservationId } = req.params;
    const { reason } = req.body;

    if (!reason) {
      throw new Error("CANCEL_REASON_REQUIRED");
    }

    await engineersService.cancelWork(
      userId,
      reservationId,
      reason
    );

    res.status(200).json({ message: "WORK_CANCELED" });
  } catch (err) {
    next(err);
  }
}

async function getMonthlyCalendar(req, res, next) {
  try {
    const userId = 1034; // TODO: auth 적용 후 req.user.id로 바꿔야함
    const { year, month } = req.query;

    if (!year || !month) {
      throw new Error("YEAR_MONTH_REQUIRED");
    }

    const data =
      await engineersService.getMonthlyCalendar(
        userId,
        Number(year),
        Number(month)
      );

    res.status(200).json(data);
  } catch (err) {
    next(err);
  }
}

export default {
  kakaoAuthorize,
  kakaoCallback,
  socialSignup,
  reissue,
  getDashboard,
  getMyReservations,
  getReservationDetail,
  startWork,
  completeWork,
  cancelWork,
  getMonthlyCalendar,
};
