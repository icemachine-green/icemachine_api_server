import db from "../models/index.js";
import { Op } from "sequelize";

const { Reservation, User, Business, Engineer, IceMachine, ServicePolicy } = db;

const reservationAdminRepository = {
  getReservationStats: async () => {
    return await Reservation.findAll({
      attributes: [
        "status",
        [db.sequelize.fn("COUNT", db.sequelize.col("status")), "count"],
      ],
      group: ["status"],
      raw: true,
    });
  },

  findAllReservations: async ({
    offset,
    limit,
    status,
    userName,
    engineerName,
  }) => {
    const whereClause = status ? { status } : {};

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
      order: [["createdAt", "DESC"]],
      paranoid: false,
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
