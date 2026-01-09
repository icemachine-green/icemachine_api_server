import dayjs from "dayjs";
import { faker } from "@faker-js/faker";

export default {
  async up(queryInterface, Sequelize) {
    // 기초 데이터 로드
    const [users] = await queryInterface.sequelize.query(
      `SELECT id FROM users WHERE role = 'customer' AND deleted_at IS NULL`
    );
    const [engineers] = await queryInterface.sequelize.query(
      `SELECT id FROM engineers WHERE deleted_at IS NULL`
    );
    const [businesses] = await queryInterface.sequelize.query(
      `SELECT id, user_id FROM businesses WHERE deleted_at IS NULL`
    );
    const [iceMachines] = await queryInterface.sequelize.query(
      `SELECT id, business_id FROM ice_machines WHERE deleted_at IS NULL`
    );
    const [servicePolicies] = await queryInterface.sequelize.query(
      `SELECT id, standard_duration FROM service_policies`
    );

    const reservations = [];
    const now = dayjs(); // 기준일: 2026-01-10

    // 기사별 날짜별 타임라인 (중복 및 이동시간 체크용)
    const engineerSchedules = {};
    engineers.forEach((eng) => {
      engineerSchedules[eng.id] = {};
    });

    // 총 1,200개 예약 생성
    for (let i = 0; i < 1200; i++) {
      const business = faker.helpers.arrayElement(businesses);
      const customer = users.find((u) => u.id === business.user_id);
      const machine = iceMachines.find((m) => m.business_id === business.id);
      const policy = faker.helpers.arrayElement(servicePolicies);
      if (!customer || !machine) continue;

      let engineer = null;
      let serviceStart = null;
      let serviceEnd = null;
      let reservedDateStr = "";
      let status = "CONFIRMED";

      // 🚩 [날짜 범위 확장] 과거 1개월 ~ 미래 2개월 (총 4개월치)
      // 오늘 기준 -30일 ~ +60일 사이의 랜덤 날짜
      for (let retry = 0; retry < 15; retry++) {
        const tempDate = now
          .add(faker.number.int({ min: -30, max: 60 }), "day")
          .startOf("day");

        // 주말(토, 일)은 예약 제외 (기사님 shift가 월~금임)
        if (tempDate.day() === 0 || tempDate.day() === 6) continue;

        reservedDateStr = tempDate.format("YYYY-MM-DD");
        const startHour = faker.number.int({ min: 9, max: 17 });
        const tempStart = tempDate.hour(startHour).minute(0).second(0);
        const tempEnd = tempStart.add(policy.standard_duration, "minute");

        // 랜덤 기사 배정 (즉시 배정 로직 반영)
        const targetEngineer = faker.helpers.arrayElement(engineers);
        const dailySchedule =
          engineerSchedules[targetEngineer.id][reservedDateStr] || [];

        // 중복 및 이동시간(60분) 체크
        const isOverlap = dailySchedule.some((sch) => {
          const occupiedStart = sch.start.subtract(60, "minute");
          const occupiedEnd = sch.end.add(60, "minute");
          return (
            tempStart.isBefore(occupiedEnd) && tempEnd.isAfter(occupiedStart)
          );
        });

        if (!isOverlap) {
          engineer = targetEngineer;
          serviceStart = tempStart;
          serviceEnd = tempEnd;

          if (!engineerSchedules[engineer.id][reservedDateStr]) {
            engineerSchedules[engineer.id][reservedDateStr] = [];
          }
          engineerSchedules[engineer.id][reservedDateStr].push({
            start: serviceStart,
            end: serviceEnd,
          });
          break;
        }
      }

      if (serviceStart && engineer) {
        // 🚩 [상태값 세분화] 날짜에 따른 자동 상태 결정
        const isPast = serviceStart.isBefore(now);
        const isToday = serviceStart.isSame(now, "day");

        if (isPast) {
          // 과거 데이터: 90% 확률로 완료, 10% 확률로 취소
          status = Math.random() < 0.9 ? "COMPLETED" : "CANCELED";
        } else if (isToday) {
          // 오늘 데이터: 시작 전이면 CONFIRMED, 시간이 지났으면 START나 COMPLETED
          status = serviceStart.isBefore(now) ? "START" : "CONFIRMED";
        } else {
          // 미래 데이터: 95% 확률로 확정, 5% 확률로 예약 취소
          status = Math.random() < 0.95 ? "CONFIRMED" : "CANCELED";
        }

        reservations.push({
          user_id: customer.id,
          business_id: business.id,
          engineer_id: engineer.id, // 무조건 기사 배정
          ice_machine_id: machine.id,
          service_policy_id: policy.id,
          reserved_date: reservedDateStr,
          service_start_time: serviceStart.format("YYYY-MM-DD HH:mm:ss"),
          service_end_time: serviceEnd.format("YYYY-MM-DD HH:mm:ss"),
          status: status,
          created_at: serviceStart
            .subtract(faker.number.int({ min: 1, max: 5 }), "day")
            .format("YYYY-MM-DD HH:mm:ss"), // 예약 생성일은 서비스일 1~5일 전으로 설정
          updated_at: now.format("YYYY-MM-DD HH:mm:ss"),
        });
      }
    }

    if (reservations.length > 0) {
      await queryInterface.bulkInsert("reservations", reservations);
    }
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete("reservations", null, {});
  },
};
