import db from "../models/index.js";
import { Op, literal } from "sequelize";
import dayjs from "dayjs";

const { Reservation, Business, ServicePolicy, IceMachine } = db;

const createReservation = async (reservationData, transaction) => {
  return await Reservation.create(reservationData, { transaction });
};

const updateReservation = async (reservationId, updateData, transaction) => {
  const [updatedRows] = await Reservation.update(updateData, {
    where: { id: reservationId },
    transaction,
  });

  return updatedRows > 0;
};

const findReservationById = async (reservationId, transaction) => {
  return await Reservation.findByPk(reservationId, { transaction });
};

/**
 * 특정 기간 내 예약 목록 조회
 */
const findReservationsByDateRange = async (startDate, endDate) => {
  return await Reservation.findAll({
    where: {
      reservedDate: {
        [Op.between]: [startDate, endDate],
      },
      status: {
        [Op.in]: ["PENDING", "CONFIRMED", "START"],
      },
    },
    raw: true,
  });
};

const findReservationsByBusinessIds = async (businessIds, status = null) => {
  const whereClause = {
    businessId: businessIds,
  };

  if (status) {
    whereClause.status = status;
  }

  return await Reservation.findAll({
    where: whereClause,
    attributes: [
      'id',
      'businessId',
      'iceMachineId',
      'servicePolicyId',
      'reservedDate',
      'serviceStartTime',
      'serviceEndTime',
      'status',
      'engineerId',
    ],
    order: [["reservedDate", "DESC"]],
    paranoid: false,
  });
};

// 예약 건수(날짜 기준)
const countByEngineerPkAndDate = async (engineerPk, date) => {
  return await Reservation.count({
    where: {
      engineerId: engineerPk,
      reservedDate: {
        [Op.eq]: date,
      },
      status: {
        [Op.in]: ["CONFIRMED", "START", "COMPLETED"], // 배정전, 취소된 예약 제외
      },
    },
  });
};

// 예약 건수(월 기준)
const countByEngineerPkAndMonth = async (engineerPk, start, end) => {
  return await Reservation.count({
    where: {
      engineerId: engineerPk,
      reservedDate: {
        [Op.between]: [start, end],
      },
      status: {
        [Op.in]: ["CONFIRMED", "START", "COMPLETED"], // 배정전, 취소된 예약 제외
      },
    },
  });
};

const findByEngineerAndDate = async ({engineerId, date, limit, offset}) => {
  return Reservation.findAndCountAll({
    where: {
      engineerId,
      reservedDate: date,
      status: {
        [Op.in]: ['CONFIRMED', 'START', 'COMPLETED'],
      },
    },
    limit,
    offset,
    include: [
      {
        model: Business,
        attributes: [
          "id",
          "name",
          "mainAddress",
          "detailedAddress",
          "managerName",
        ],
        required: false,
      },
      {
        model: ServicePolicy,
        attributes: ["serviceType"],
        required: false,
      },
      {
        model: IceMachine,
        attributes: ["modelName", "sizeType"],
        required: false,
      },
    ],
    order: [
      [
        literal(`
          CASE
            WHEN status = 'START' THEN 0
            WHEN status = 'CONFIRMED' THEN 1
            WHEN status = 'COMPLETED' THEN 2
            WHEN status = 'CANCELED' THEN 3
            ELSE 99
          END
        `),
        "ASC",
      ],
      ["serviceStartTime", "ASC"],
    ],
  });
};

const findByEngineerAndMonth = async (
  engineerId,
  start,
  end
) => {
  return Reservation.findAll({
    where: {
      engineerId,
      reservedDate: {
        [Op.between]: [start, end],
      },
      status: {
        [Op.in]: [
          "CONFIRMED",
          "START",
          "COMPLETED",
        ],
      },
    },
    attributes: ["reservedDate"],
    raw: true,
  });
};

const findDetailByIdAndEngineer = async (
  reservationId,
  engineerPk
) => {
  return await Reservation.findOne({
    where: {
      id: reservationId,
      engineerId: engineerPk,
    },
    include: [
      {
        model: Business,
        attributes: [
          "name",
          "managerName",
          "phoneNumber",
          "mainAddress",
          "detailedAddress",
        ],
      },
      {
        model: ServicePolicy,
        attributes: [
          "serviceType",
          "standardDuration",
        ],
      },
      {
        model: IceMachine,
        attributes: [
          "modelName",
          "sizeType",
          "modelPic",
        ],
      },
    ],
  });
};

const countTodayWorksByEngineerId = async (engineerId) => {
  const today = dayjs().format("YYYY-MM-DD");

  return await Reservation.count({
    where: {
      engineerId,
      reservedDate: today,
      status: {
        [Op.in]: [
          "CONFIRMED",
          "START",
          "COMPLETED",
        ],
      },
    },
  });
};

const countTotalWorksByEngineerId = async (engineerId) => {
  return await Reservation.count({
    where: {
      engineerId,
      status: {
        [Op.in]: [
          "CONFIRMED",
          "START",
          "COMPLETED",
        ],
      },
    },
  });
};

const findCompletedWorksByEngineerId = async (engineerId) => {
  return await Reservation.findAll({
    where: {
      engineerId,
      status: "COMPLETED",
    },
    attributes: ["id", "reservedDate"],
    include: [
      {
        model: Business,
        attributes: ["managerName"],
      },
    ],
    order: [["reservedDate", "DESC"]],
    limit: 20,
  });
};

/**
 * 현재 예약보다 앞선 예약 중
 * COMPLETED, CANCELED 가 아닌 예약 존재 여부
 */
const existsPreviousUnfinishedReservation = async ({
  engineerId,
  reservedDate,
  serviceStartTime,
}) => {
  const count = await Reservation.count({
    where: {
      engineerId,
      reservedDate,
      serviceStartTime: {
        [Op.lt]: serviceStartTime,
      },
      status: {
        [Op.notIn]: ["COMPLETED", "CANCELED"],
      },
    },
  });

  return count > 0;
};

export default {
  createReservation,
  updateReservation,
  findReservationById,
  findReservationsByDateRange,
  findReservationsByBusinessIds,
  countByEngineerPkAndDate,
  countByEngineerPkAndMonth,
  findByEngineerAndDate,
  findByEngineerAndMonth,
  findDetailByIdAndEngineer,
  countTodayWorksByEngineerId,
  countTotalWorksByEngineerId,
  findCompletedWorksByEngineerId,
  existsPreviousUnfinishedReservation,
};
