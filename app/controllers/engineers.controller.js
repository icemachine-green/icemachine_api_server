/**
 * @file app/controllers/engineers.controller.js
 * @description 기사 관련 컨트롤러
 * 260106 v1.0.0 Jung init
 */

import engineersService from "../services/engineers.service.js";
import { createBaseResponse } from "../utils/createBaseResponse.util.js";
import { SUCCESS } from "../../configs/responseCode.config.js";
import cookieUtil from "../utils/cookie/cookie.util.js";

// 최종 회원가입 (신규 함수)
async function socialSignup(req, res, next) {
  try {
    const { socialId, provider, name, phoneNumber, email } = req.body;
    const { accessToken, refreshToken, user } = await engineersService.createAndLoginEngineer(
      socialId,
      provider,
      name,
      phoneNumber,
      email
    );

    cookieUtil.setCookieRefreshToken(res, refreshToken);

    return res.status(SUCCESS.status).json(createBaseResponse(SUCCESS, {accessToken, user}));
  } catch (err) {
    console.error(err);
    next(err);
  }
}

async function getDashboard(req, res, next) {
  try {
    const userId = req.user.id; // users.id임
    const data = await engineersService.getDashboard(userId);
    
    res.status(SUCCESS.status).json(createBaseResponse(SUCCESS, data));
  } catch (err) {
    console.error(err);
    next(err);
  }
};

// 기사 - 날짜별 예약 조회
async function getMyReservations(req, res, next) {
  try {
    const userId = req.user.id;
    const date = req.query.date;
    const page = req.query.page ? Number(req.query.page) : 1;
    const limit = req.query.limit ? Number(req.query.limit) : 3;
    const offset = (page - 1) * limit;

    const { count, rows } = await engineersService.getDailyReservations({userId, date, limit, offset});

    const reservations = rows.map((r) => ({
      reservationId: r.id,
      startAt: r.serviceStartTime,
      endAt: r.serviceEndTime,
      canStart: r.canStart,

      // Business 기준
      managerName: r.Business?.managerName ?? null,
      businessName: r.Business?.name ?? null,
      businessAddress: r.Business
        ? `${r.Business.mainAddress} ${r.Business.detailedAddress ?? ""}`
        : null,

      // ServicePolicy 기준
      serviceType: r.ServicePolicy?.serviceType ?? null,

      modelName: r.IceMachine?.modelName ?? null,
      sizeType: r.IceMachine?.sizeType ?? null,

      status: r.status,
    }));

    res.status(SUCCESS.status).json(createBaseResponse(SUCCESS, {date, limit, total: count, page, reservations }));
  } catch (err) {
    next(err);
  }
};

// 예약 상세 조회
async function getReservationDetail(req, res, next) {
  try {
    const userId = req.user.id;
    const { reservationId } = req.params;

    const reservation =
      await engineersService.getReservationDetail(
        userId,
        reservationId
      );

    res.status(SUCCESS.status).json(createBaseResponse(SUCCESS, {reservation}));
  } catch (err) {
    next(err);
  }
}

async function startWork(req, res, next) {
  try {
    const userId = req.user.id;
    const { reservationId } = req.params;

    await engineersService.startWork(userId, reservationId);

    res.status(SUCCESS.status).json(createBaseResponse(SUCCESS, {message: "WORK_STARTED"}));
  } catch (err) {
    next(err);
  }
}

async function completeWork(req, res, next) {
  try {
    const userId = req.user.id;
    const { reservationId } = req.params;

    await engineersService.completeWork(userId, reservationId);

    res.status(SUCCESS.status).json(createBaseResponse(SUCCESS, {message: "WORK_COMPLETED" }));
  } catch (err) {
    next(err);
  }
}

async function cancelWork(req, res, next) {
  try {
    const userId = req.user.id;
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

    res.status(SUCCESS.status).json(createBaseResponse(SUCCESS, {message: "WORK_CANCELED"}));
  } catch (err) {
    next(err);
  }
}

async function getMonthlyCalendar(req, res, next) {
  try {
    const userId = req.user.id;
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

    res.status(SUCCESS.status).json(createBaseResponse(SUCCESS, data));
  } catch (err) {
    next(err);
  }
}

async function getMyPage(req, res, next) {
  try {
    const userId = req.user.id;
    const page = req.query.page ? parseInt(req.query.page, 10) : 1;
    const limit = req.query.limit ? parseInt(req.query.limit, 10) : 5;

    const data = await engineersService.getEngineerMyPage(userId, { page, limit });

    res.status(SUCCESS.status).json(createBaseResponse(SUCCESS, data));
  } catch (err) {
    next(err);
  }
};

export default {
  socialSignup,
  getDashboard,
  getMyReservations,
  getReservationDetail,
  startWork,
  completeWork,
  cancelWork,
  getMonthlyCalendar,
  getMyPage,
};
