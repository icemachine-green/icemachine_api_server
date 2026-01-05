import db from "../models/index.js";
import { Op } from "sequelize";

const { Reservation } = db;

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

export default {
  createReservation,
  updateReservation,
  findReservationById,
  findReservationsByDateRange,
  findReservationsByBusinessIds,
};
