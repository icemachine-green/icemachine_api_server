import bcrypt from 'bcrypt';
import dayjs from 'dayjs';

export default {
  async up(queryInterface) {
    const passwordHash = await bcrypt.hash('superadmin123', 10);

    await queryInterface.bulkInsert('admins', [{
      username: 'superadmin',
      password_hash: passwordHash,
      name: '최고관리자',
      role: 'SUPER_ADMIN',
      is_active: true,
      created_at: dayjs().format('YYYY-MM-DD HH:mm:ss'),
      updated_at: dayjs().format('YYYY-MM-DD HH:mm:ss'),
    }]);
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete('admins', { username: 'superadmin' }, {});
  },
};

