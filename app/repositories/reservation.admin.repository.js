import db from "../models/index.js";
import { Op } from "sequelize";
import dayjs from "dayjs";

const { Reservation, User, Business, Engineer, IceMachine, ServicePolicy } = db;

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

const getWhereClauseByMode = (mode, startDate) => {
  const where = {};
  if (!startDate) return where;
  const start = dayjs(startDate).format("YYYY-MM-DD");

  switch (mode) {
    case "today":
      where.reservedDate = start;
      break;
    case "weekly":
      where.reservedDate = {
        [Op.between]: [
          start,
          dayjs(startDate).add(7, "day").format("YYYY-MM-DD"),
        ],
      };
      break;
    case "monthly":
      where.reservedDate = {
        [Op.between]: [
          start,
          dayjs(startDate).add(30, "day").format("YYYY-MM-DD"),
        ],
      };
      break;
    case "future":
    default:
      where.reservedDate = { [Op.gte]: start };
      break;
  }
  return where;
};

const findAllReservations = async ({
  offset,
  limit,
  startDate,
  mode,
  status,
  totalSearch,
  reservationId,
  userName, // 🚩 추가: 고객명 정밀 검색
  businessName, // 🚩 추가: 매장명 정밀 검색
  engineerName, // 🚩 추가: 기사명 정밀 검색
}) => {
  const whereClause = getWhereClauseByMode(mode, startDate);

  if (status && status !== "ALL") {
    whereClause.status = status;
  }

  // 🚩 검색 로직 정교화 (우선순위: ID > 개별필터 > 통합검색)
  if (reservationId) {
    whereClause.id = reservationId;
  } else if (userName || businessName || engineerName) {
    // 특정 필터가 들어온 경우 해당 필드만 검색
    if (userName) {
      whereClause["$User.name$"] = { [Op.like]: `%${userName}%` };
    }
    if (businessName) {
      whereClause["$Business.name$"] = { [Op.like]: `%${businessName}%` };
    }
    if (engineerName) {
      whereClause["$Engineer.User.name$"] = { [Op.like]: `%${engineerName}%` };
    }
  } else if (totalSearch) {
    // 기존 통합 검색 유지 (하위 호환성)
    whereClause[Op.or] = [
      { "$User.name$": { [Op.like]: `%${totalSearch}%` } },
      { "$Business.name$": { [Op.like]: `%${totalSearch}%` } },
      { "$Engineer.User.name$": { [Op.like]: `%${totalSearch}%` } },
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

const getReservationStats = async (filters = {}) => {
  const { startDate, mode } = filters;
  const whereClause = getWhereClauseByMode(mode, startDate);
  return await Reservation.findAll({
    attributes: [
      "status",
      [db.sequelize.fn("COUNT", db.sequelize.col("id")), "count"],
    ],
    where: whereClause,
    group: ["status"],
    raw: true,
  });
};

/**
 * 기사 배정 및 상태 업데이트
 * 260111 v1.1.0 Taeho-update (Assign logic)
 */
const updateEngineerAssignment = async (id, engineerId) => {
  const [affectedCount] = await Reservation.update(
    {
      engineer_id: engineerId,
      status: "CONFIRMED",
    },
    { where: { id } }
  );
  return affectedCount > 0;
};

/**
 * 추천 기사 조회를 위한 기사별 오늘 일정 및 좌표 데이터 확보
 */
const findEngineersWithScheduleForRecommendation = async (date) => {
  return await Engineer.findAll({
    where: { isActive: true },
    include: [
      { model: User, as: "User", attributes: ["name", "phoneNumber"] },
      {
        model: Reservation,
        as: "Reservations",
        where: {
          reservedDate: date,
          status: { [Op.in]: ["CONFIRMED", "START", "COMPLETED"] },
        },
        required: false,
        include: [
          {
            model: Business,
            as: "Business",
            attributes: ["latitude", "longitude"],
          },
          {
            model: ServicePolicy,
            as: "ServicePolicy",
            attributes: ["standardDuration"],
          },
        ],
      },
    ],
  });
};

export default {
  findAllReservations,
  findEngineersWithScheduleForRecommendation,
  updateEngineerAssignment,
  findReservationDetail: async (id) =>
    await Reservation.findByPk(id, { include: commonInclude }),
  getReservationStats,
  updateReservationStatus: async (id, status) => {
    const [affectedCount] = await Reservation.update(
      { status },
      { where: { id } }
    );
    return affectedCount > 0;
  },
};
