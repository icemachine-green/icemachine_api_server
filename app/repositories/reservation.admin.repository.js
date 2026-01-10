/**
 * @file app/repositories/reservation.admin.repository.js
 */
import db from "../models/index.js";
import { Op } from "sequelize";

const { Reservation, User, Business, Engineer, IceMachine, ServicePolicy } = db;

// 조인 구조 공통화 (목록/상세 동일하게 사용)
const commonInclude = [
  { model: User, as: "User", attributes: ["name", "phoneNumber"] },
  {
    model: Business,
    as: "Business",
    attributes: ["name", "mainAddress", "detailedAddress", "phoneNumber"],
  },
  {
    model: Engineer,
    as: "Engineer",
    include: [{ model: User, as: "User", attributes: ["name", "phoneNumber"] }],
  },
  {
    model: IceMachine,
    as: "IceMachine",
    attributes: ["brandName", "modelName", "sizeType"],
  },
  { model: ServicePolicy, as: "ServicePolicy", attributes: ["serviceType"] },
];

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

  return await Reservation.findAndCountAll({
    where: whereClause,
    include: commonInclude,
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

// 🚩 상세 정보 조회를 위한 함수 추가
const findReservationDetail = async (id) => {
  return await Reservation.findByPk(id, {
    include: commonInclude,
  });
};

// 🚩 상태 업데이트를 위한 함수 추가
const updateReservationStatus = async (id, status) => {
  const [affectedCount] = await Reservation.update(
    { status },
    { where: { id } }
  );
  return affectedCount > 0;
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
  findReservationDetail,
  getReservationStats,
  updateReservationStatus,
};
