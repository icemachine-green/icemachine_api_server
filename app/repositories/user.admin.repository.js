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

    // 1. 조건 설정
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

    // 2. 전체 카운트 조회 (필터가 적용된 유저 수)
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

    // 3. 조건에 맞는 유저 ID들만 먼저 추출 (Pagination 적용)
    let order = [["createdAt", "DESC"]];
    if (sort === "reservation") {
      order = [[sequelize.literal("reservationCount"), "DESC"]];
    }

    const usersWithIds = await User.findAll({
      where,
      attributes: ["id"], // ID만 가져옴
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
      subQuery: false, // ID만 가져올때는 subQuery가 필요 없음
    });

    const userIds = usersWithIds.map((u) => u.id);

    // 4. 추출된 ID들에 해당하는 전체 데이터 조회
    if (userIds.length === 0) {
      return { count: 0, rows: [] };
    }

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
      include: [
        {
          model: Business,
          required: false, // 이미 위에서 필터링된 ID들이므로 여기선 전체 매장 노출
        },
      ],
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
