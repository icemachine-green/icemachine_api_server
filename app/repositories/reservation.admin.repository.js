/**
 * @file app/repositories/reservation.admin.repository.js
 */
import db from "../models/index.js";
import { Op } from "sequelize";

const { Reservation, User, Business, Engineer, IceMachine, ServicePolicy } = db;

const findAllReservations = async ({
  offset,
  limit,
  startDate,
  status,
  totalSearch,
}) => {
  const whereClause = {};

  if (startDate) {
    whereClause.reservedDate = { [Op.gte]: startDate };
  }

  if (status && status !== "ALL") {
    whereClause.status = status;
  }

  if (totalSearch) {
    whereClause[Op.or] = [
      { "$User.name$": { [Op.like]: `%${totalSearch}%` } },
      { "$Business.name$": { [Op.like]: `%${totalSearch}%` } },
    ];
  }

  const includeClause = [
    { model: User, as: "User", attributes: ["name", "phoneNumber"] },
    {
      model: Business,
      as: "Business",
      attributes: ["name", "mainAddress", "detailedAddress", "phoneNumber"],
    },
    {
      model: Engineer,
      as: "Engineer",
      include: [
        { model: User, as: "User", attributes: ["name", "phoneNumber"] },
      ],
    },
    {
      model: IceMachine,
      as: "IceMachine",
      // 🚩 수정: modelType 제거하고 brandName 추가
      attributes: ["brandName", "modelName", "sizeType"],
    },
    { model: ServicePolicy, as: "ServicePolicy", attributes: ["serviceType"] },
  ];

  return await Reservation.findAndCountAll({
    where: whereClause,
    include: includeClause,
    offset,
    limit,
    subQuery: false,
    distinct: true,
    order: [
      [db.sequelize.col("Reservation.reserved_date"), "ASC"],
      [db.sequelize.col("Reservation.service_start_time"), "ASC"],
    ],
  });
};

const getReservationStats = async (startDate) => {
  return await Reservation.findAll({
    attributes: [
      "status",
      [db.sequelize.fn("COUNT", db.sequelize.col("id")), "count"],
    ],
    where: startDate ? { reservedDate: { [Op.gte]: startDate } } : {},
    group: ["status"],
    raw: true,
  });
};

export default {
  findAllReservations,
  getReservationStats,
};
