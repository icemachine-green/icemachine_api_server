/**
 * @file app/services/users.service.js
 * @description 유저 관련 서비스
 * 251216 v1.0.0 Lee init
 */
import usersRepository from "../repositories/users.repository.js";
import { CONFLICT_ERROR } from "../../configs/responseCode.config.js";

const processKakaoUser = async (socialId) => {
  const user = await usersRepository.findUserBySocialId(socialId);
  return user;
};

const createSocialUser = async (socialId, provider, name, phoneNumber, email) => {
  // 이메일 중복 확인
  const existingUser = await usersRepository.findUserByEmail(email);
  if (existingUser) {
    throw { ...CONFLICT_ERROR, info: "이미 존재하는 이메일입니다." };
  }

  // 신규 소셜 사용자 생성
  const newUser = await usersRepository.createUser({
    socialId,
    provider,
    name,
    phoneNumber,
    email,
    role: 'customer', // 신규 가입 시 기본 역할
  });

  return newUser;
};

export default { processKakaoUser, createSocialUser };