/**
 * @file app/repositories/reservation.admin.repository.js
 */
import db from "../models/index.js";
import { Op } from "sequelize";

const { Reservation, User, Business, Engineer, IceMachine, ServicePolicy } = db;

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

    if (status) whereClause.status = status;
    if (startDate && !hasSearch)
      whereClause.reservedDate = { [Op.gte]: startDate };

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

    const sortMap = {
      reservedDate: "reserved_date",
      createdAt: "created_at",
      status: "status",
      id: "id",
    };
    const dbOrderBy = sortMap[orderBy] || "reserved_date";

    return await Reservation.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: User,
          as: "User",
          attributes: ["name", "phoneNumber"],
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
            { model: User, as: "User", attributes: ["name", "phoneNumber"] },
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
      order: [[dbOrderBy, sortBy?.toUpperCase() === "DESC" ? "DESC" : "ASC"]],
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
