import db from "../models/index.js";
import { Op } from "sequelize";

const { Reservation, User, Business, Engineer, IceMachine, ServicePolicy } = db;

const reservationAdminRepository = {
  /**
   * 예약 상태별 통계 조회
   * - startDate가 있으면: 해당 날짜 "당일" 통계 (프론트의 '오늘' 버튼)
   * - startDate가 없으면: "오늘부터 미래 전체" 통계 (프론트의 '전체' 버튼)
   */
  getReservationStats: async (startDate) => {
    const whereClause = {};

    if (startDate) {
      // 1. 특정 날짜가 전달된 경우: 딱 그 날짜만 (Equal)
      whereClause.reservedDate = startDate;
    } else {
      // 2. 파라미터가 없는 경우: 오늘부터 미래 전체 (Greater than or Equal)
      const today = new Date().toISOString().split("T")[0];
      whereClause.reservedDate = {
        [Op.gte]: today,
      };
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
   * 예약 목록 조회 (필터 및 페이징)
   */
  findAllReservations: async ({
    offset,
    limit,
    status,
    userName,
    engineerName,
    orderBy,
    sortBy,
    reservationId,
    startDate,
  }) => {
    const whereClause = {};

    if (reservationId) {
      whereClause.id = reservationId;
    } else {
      if (status) whereClause.status = status;

      // 목록 조회는 항상 지정된 날짜 '이후'를 보여주는 것이 대시보드 운영에 유리함
      if (startDate) {
        whereClause.reservedDate = {
          [Op.gte]: startDate,
        };
      }
    }

    // 정렬 로직: 기본값은 예약일 빠른순(ASC)
    let orderClause = [];
    if (
      !orderBy ||
      orderBy === "serviceStartTime" ||
      orderBy === "reservedDate"
    ) {
      orderClause = [
        ["reservedDate", "ASC"],
        ["serviceStartTime", "ASC"],
      ];
    } else {
      const orderDirection = sortBy || "DESC";
      orderClause = [[orderBy, orderDirection]];
    }

    const includeClause = [
      {
        model: User,
        as: "User",
        attributes: ["name", "phoneNumber"],
        required: !!userName,
        where: userName ? { name: { [Op.like]: `%${userName}%` } } : {},
      },
      {
        model: Business,
        attributes: ["name", "mainAddress", "detailedAddress", "phoneNumber"],
      },
      {
        model: Engineer,
        attributes: ["id"],
        required: !!engineerName,
        include: [
          {
            model: User,
            as: "User",
            attributes: ["name", "phoneNumber"],
            where: engineerName
              ? { name: { [Op.like]: `%${engineerName}%` } }
              : {},
          },
        ],
      },
      { model: IceMachine, attributes: ["modelName", "modelType", "sizeType"] },
      { model: ServicePolicy, attributes: ["serviceType"] },
    ];

    return await Reservation.findAndCountAll({
      where: whereClause,
      include: includeClause,
      attributes: [
        "id",
        "reservedDate",
        "serviceStartTime",
        "serviceEndTime",
        "status",
        "createdAt",
      ],
      offset,
      limit,
      order: orderClause,
      paranoid: false,
      distinct: true,
    });
  },

  /**
   * 예약 상세 정보 조회
   */
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

  /**
   * 예약 상태 업데이트
   */
  updateReservationStatus: async (id, status) => {
    const [updatedRows] = await Reservation.update(
      { status },
      { where: { id } }
    );
    return updatedRows > 0;
  },
};

export default reservationAdminRepository;
