/**
 * @description businesses 테이블에 위도(latitude), 경도(longitude) 컬럼 추가
 */
export async function up(queryInterface, Sequelize) {
  await queryInterface.addColumn("businesses", "latitude", {
    type: Sequelize.DECIMAL(10, 8),
    allowNull: true,
    comment: "매장 위도",
  });
  await queryInterface.addColumn("businesses", "longitude", {
    type: Sequelize.DECIMAL(11, 8),
    allowNull: true,
    comment: "매장 경도",
  });
}

export async function down(queryInterface, Sequelize) {
  await queryInterface.removeColumn("businesses", "latitude");
  await queryInterface.removeColumn("businesses", "longitude");
}
