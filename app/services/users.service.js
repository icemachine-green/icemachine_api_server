/**
 * @file app/services/users.service.js
 * @description 유저 관련 서비스
 * 251216 v1.0.0 Lee init
 */
import usersRepository from "../repositories/users.repository.js";

const processKakaoUser = async (socialId) => {
  const user = await usersRepository.findUserBySocialId(socialId);
  return user;
};

export default { processKakaoUser };