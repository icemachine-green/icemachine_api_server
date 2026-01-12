import db from "../models/index.js";
import { Op } from "sequelize";

const {
  User,
  Business,
  Reservation,
  IceMachine,
  ServicePolicy,
  Engineer,
  sequelize,
} = db;

const userAdminRepository = {
  findAllUsers: async ({
    offset,
    limit,
    userName,
    businessName,
    address,
    startDate,
    endDate,
    sort,
  }) => {
    const where = {};
    const businessWhere = {};

    if (userName) where.name = { [Op.like]: `%${userName}%` };
    if (startDate && endDate) {
      where.createdAt = {
        [Op.between]: [`${startDate} 00:00:00`, `${endDate} 23:59:59`],
      };
    }

    if (businessName) businessWhere.name = { [Op.like]: `%${businessName}%` };
    if (address) {
      businessWhere[Op.or] = [
        { mainAddress: { [Op.like]: `%${address}%` } },
        { detailedAddress: { [Op.like]: `%${address}%` } },
      ];
    }

    // 1. 정렬 기준 설정 (오래된순 제외, 나머지는 유지)
    let order;
    if (sort === "reservation") {
      order = [[sequelize.literal("reservationCount"), "DESC"]];
    } else if (sort === "business") {
      order = [[sequelize.literal("businessCount"), "DESC"]];
    } else {
      // 기본값 및 최신순
      order = [["createdAt", "DESC"]];
    }

    // 2. 전체 카운트
    const countResult = await User.count({
      where,
      distinct: true,
      include:
        Object.keys(businessWhere).length > 0
          ? [
              {
                model: Business,
                where: businessWhere,
                required: true,
              },
            ]
          : [],
    });

    // 3. 1단계: ID 추출 (정렬 적용)
    const usersWithIds = await User.findAll({
      where,
      attributes: [
        "id",
        [
          sequelize.literal(
            `(SELECT COUNT(*) FROM businesses WHERE businesses.user_id = User.id)`
          ),
          "businessCount",
        ],
        [
          sequelize.literal(
            `(SELECT COUNT(*) FROM reservations WHERE reservations.user_id = User.id)`
          ),
          "reservationCount",
        ],
      ],
      include:
        Object.keys(businessWhere).length > 0
          ? [
              {
                model: Business,
                where: businessWhere,
                attributes: [],
                required: true,
              },
            ]
          : [],
      offset: Number(offset) || 0,
      limit: Number(limit) || 8,
      order,
      subQuery: false,
    });

    const userIds = usersWithIds.map((u) => u.id);
    if (userIds.length === 0) return { count: 0, rows: [] };

    // 4. 2단계: 최종 데이터 조회
    const rows = await User.findAll({
      where: { id: { [Op.in]: userIds } },
      attributes: {
        include: [
          [
            sequelize.literal(
              `(SELECT COUNT(*) FROM businesses WHERE businesses.user_id = User.id)`
            ),
            "businessCount",
          ],
          [
            sequelize.literal(
              `(SELECT COUNT(*) FROM reservations WHERE reservations.user_id = User.id)`
            ),
            "reservationCount",
          ],
        ],
      },
      include: [{ model: Business, required: false }],
      order,
    });

    return { count: countResult, rows };
  },

  findUserDetail: async (id) => {
    return await User.findByPk(id, {
      include: [
        { model: Business, include: [{ model: IceMachine }] },
        {
          model: Reservation,
          include: [
            { model: Business },
            { model: ServicePolicy },
            { model: Engineer, include: [{ model: User }] },
          ],
        },
      ],
      order: [[Reservation, "id", "DESC"]],
      paranoid: false,
    });
  },
};

export default userAdminRepository;
