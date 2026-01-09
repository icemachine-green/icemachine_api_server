import db from "../models/index.js";
import { Op } from "sequelize";

const { Reservation, User, Business, Engineer, IceMachine, ServicePolicy } = db;

/**
 * 공백 무시 검색을 위한 헬퍼 함수
 * DB 컬럼의 공백을 제거(REPLACE)하고, 입력값의 공백도 제거하여 비교합니다.
 */
const makeNoSpaceCondition = (columnPath, value) => {
  return db.sequelize.where(
    db.sequelize.fn("REPLACE", db.sequelize.col(columnPath), " ", ""),
    { [Op.like]: `%${value.replace(/\s+/g, "")}%` }
  );
};

const reservationAdminRepository = {
  getReservationStats: async (startDate) => {
    const whereClause = {};
    if (startDate) {
      whereClause.reservedDate = startDate;
    } else {
      const today = new Date().toISOString().split("T")[0];
      whereClause.reservedDate = { [Op.gte]: today };
    }

    return await Reservation.findAll({
      where: whereClause,
      attributes: [
        "status",
        [db.sequelize.fn("COUNT", db.sequelize.col("status")), "count"],
      ],
      group: ["status"],
      raw: true,
    });
  },

  /**
   * 예약 목록 조회 (공백 무시 검색 및 기사 이름 조인 포함)
   */
  findAllReservations: async ({
    offset,
    limit,
    status,
    userName,
    engineerName,
    businessName,
    totalSearch,
    orderBy,
    sortBy,
    reservationId,
    startDate,
  }) => {
    const whereClause = {};
    const hasSearch = !!(
      totalSearch ||
      reservationId ||
      userName ||
      businessName ||
      engineerName
    );

    // 1. 날짜 및 상태 필터
    if (status) whereClause.status = status;
    if (startDate && !hasSearch) {
      whereClause.reservedDate = { [Op.gte]: startDate };
    }

    // 2. 공백 무시 검색 로직 적용
    // Engineer 테이블은 User와 조인되어 있으므로 'Engineer->User.name' 경로를 사용합니다.
    if (totalSearch) {
      const cleanSearch = totalSearch.replace(/\s+/g, "");
      const isNumeric = /^\d+$/.test(cleanSearch);

      whereClause[Op.or] = [
        ...(isNumeric ? [{ id: cleanSearch }] : []),
        makeNoSpaceCondition("User.name", cleanSearch),
        makeNoSpaceCondition("Business.name", cleanSearch),
        makeNoSpaceCondition("Engineer->User.name", cleanSearch),
      ];
    } else {
      if (reservationId) whereClause.id = reservationId;
      if (userName)
        whereClause[Op.and] = [makeNoSpaceCondition("User.name", userName)];
      if (businessName)
        whereClause[Op.and] = [
          makeNoSpaceCondition("Business.name", businessName),
        ];
      if (engineerName)
        whereClause[Op.and] = [
          makeNoSpaceCondition("Engineer->User.name", engineerName),
        ];
    }

    let orderClause = [];
    if (orderBy && sortBy) {
      orderClause.push([orderBy, sortBy.toUpperCase()]);
    } else {
      orderClause.push(["reservedDate", "ASC"], ["serviceStartTime", "ASC"]);
    }

    return await Reservation.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: User,
          as: "User",
          attributes: ["name", "phoneNumber"],
          // 검색 시 필수 포함(Inner Join), 평시에는 전체 노출(Left Join)
          required: !!(
            userName ||
            (totalSearch && !/^\d+$/.test(totalSearch.replace(/\s+/g, "")))
          ),
        },
        {
          model: Business,
          attributes: ["name", "mainAddress", "detailedAddress", "phoneNumber"],
          required: !!(businessName || totalSearch),
        },
        {
          model: Engineer,
          required: !!(engineerName || totalSearch),
          include: [
            {
              model: User,
              as: "User",
              attributes: ["name", "phoneNumber"],
            },
          ],
        },
        {
          model: IceMachine,
          attributes: ["modelName", "modelType", "sizeType"],
        },
        { model: ServicePolicy, attributes: ["serviceType"] },
      ],
      offset,
      limit,
      order: orderClause,
      distinct: true,
    });
  },

  findReservationDetail: async (id) => {
    return await Reservation.findByPk(id, {
      include: [
        {
          model: User,
          as: "User",
          attributes: ["name", "phoneNumber", "email"],
        },
        {
          model: Business,
          attributes: [
            "name",
            "mainAddress",
            "detailedAddress",
            "phoneNumber",
            "managerName",
          ],
        },
        {
          model: Engineer,
          include: [
            { model: User, as: "User", attributes: ["name", "phoneNumber"] },
          ],
        },
        {
          model: IceMachine,
          attributes: ["modelName", "modelType", "sizeType", "modelPic"],
        },
        {
          model: ServicePolicy,
          attributes: [
            "serviceType",
            "sizeType",
            "standardDuration",
            "description",
          ],
        },
      ],
      paranoid: false,
    });
  },

  updateReservationStatus: async (id, status) => {
    const [updatedRows] = await Reservation.update(
      { status },
      { where: { id } }
    );
    return updatedRows > 0;
  },
};

export default reservationAdminRepository;
