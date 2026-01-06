/**
 * @file app/controllers/engineers.controller.js
 * @description 기사 관련 컨트롤러
 * 260106 v1.0.0 Jung init
 */

import engineersService from "../services/engineers.service.js";

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
  getDashboard,
  getMyReservations,
  getReservationDetail,
  startWork,
  completeWork,
  cancelWork,
  getMonthlyCalendar,
};
