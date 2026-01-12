import db from "../models/index.js";
import { Op } from "sequelize";

const { Engineer, User, sequelize } = db;

const engineerAdminRepository = {
  /**
   * 기사 목록 조회 (퇴사자 포함)
   */
  findAllEngineers: async ({ offset, limit, licenseLevel, status, search }) => {
    const where = {};

    if (licenseLevel) where.skillLevel = licenseLevel;

    // 🚩 상태 필터 로직 고도화
    if (status === "활성") {
      where.isActive = true;
      where.deletedAt = null;
    } else if (status === "비활성") {
      where.isActive = false;
      where.deletedAt = null;
    } else if (status === "퇴사") {
      where.deletedAt = { [Op.ne]: null };
    }

    if (search) {
      where[Op.or] = [
        { "$User.name$": { [Op.like]: `%${search}%` } },
        { "$User.phone_number$": { [Op.like]: `%${search}%` } },
      ];
    }

    return await Engineer.findAndCountAll({
      where,
      include: [
        {
          model: User,
          as: "User",
          attributes: ["name", "phoneNumber", "email"],
        },
      ],
      attributes: {
        include: [
          // 퇴사 여부를 판단하는 가상 컬럼 추가
          [
            sequelize.literal(
              `CASE WHEN Engineer.deleted_at IS NOT NULL THEN '퇴사' WHEN Engineer.is_active = 1 THEN '활성' ELSE '비활성' END`
            ),
            "displayStatus",
          ],
          [
            sequelize.literal(
              `(SELECT COUNT(*) FROM reservations WHERE engineer_id = Engineer.id AND status = 'COMPLETED')`
            ),
            "totalCompletedCount",
          ],
        ],
      },
      offset,
      limit,
      paranoid: false,
      order: [
        [
          sequelize.literal(
            "CASE WHEN Engineer.deleted_at IS NOT NULL THEN 3 WHEN Engineer.is_active = 1 THEN 1 ELSE 2 END"
          ),
          "ASC",
        ],
        ["createdAt", "DESC"],
      ],
      subQuery: false,
      distinct: true,
    });
  },

  /**
   * 대시보드 요약 통계
   */
  getEngineerSummaryStats: async () => {
    const total = await Engineer.count({ paranoid: false });
    const active = await Engineer.count({ where: { isActive: true } });
    const resigned = await Engineer.count({
      where: { deletedAt: { [Op.ne]: null } },
      paranoid: false,
    });

    return {
      totalEngineers: total,
      activeEngineers: active,
      resignedEngineers: resigned,
      inactiveEngineers: total - active - resigned,
    };
  },

  /**
   * 기사 상세 정보 조회
   */
  findEngineerDetail: async (id) => {
    return await Engineer.findByPk(id, {
      include: [
        {
          model: User,
          as: "User",
          attributes: ["name", "phoneNumber", "email"],
        },
      ],
      attributes: {
        include: [
          [
            sequelize.literal(
              `(SELECT COUNT(*) FROM reservations WHERE engineer_id = Engineer.id AND status = 'COMPLETED')`
            ),
            "totalCompletedCount",
          ],
        ],
      },
      paranoid: false, // 퇴사한 기사 상세 정보도 볼 수 있도록 설정
    });
  },

  /**
   * 기사 정보 수정 (시나리오 C 해결)
   */
  updateEngineer: async (id, data) => {
    const [affectedCount] = await Engineer.update(data, {
      where: { id },
      paranoid: false,
    });
    return affectedCount > 0;
  },

  /**
   * 기사 상태(활성/비활성) 수정 (시나리오 D 해결)
   */
  updateStatus: async (id, statusLabel) => {
    const isActive = statusLabel === "활성";
    const [affectedCount] = await Engineer.update(
      { isActive },
      {
        where: { id },
        paranoid: false,
      }
    );
    return affectedCount > 0;
  },
};

export default engineerAdminRepository;
