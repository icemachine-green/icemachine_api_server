/**
 * @file app/services/users.service.js
 * @description 유저 관련 서비스
 * 251216 v1.0.0 Lee init
 */
import usersRepository from "../repositories/users.repository.js";
import bcrypt from "bcrypt";
import { CONFLICT_ERROR } from "../../configs/responseCode.config.js";

const signup = async (email, password, name, phone_number, role, address, provider, social_id, profile_image_url) => {
  // 이메일 또는 이름 중복 확인 (Repository 사용)
  const existingUser = await usersRepository.findUserByEmailOrName(email, name);

  if (existingUser) {
    let err;
    if (existingUser.email === email) {
      err = { ...CONFLICT_ERROR, info: "이미 존재하는 이메일입니다."};
    } else { // existingUser.name === name
      err = { ...CONFLICT_ERROR, info: "이미 존재하는 이름입니다."};
    }
    throw err;
  }

  // 비밀번호 해싱
  const hashedPassword = await bcrypt.hash(password, 10);

  // 사용자 생성 (Repository 사용)
  const newUser = await usersRepository.createUser({
    email,
    password: hashedPassword,
    name,
    phone_number,
    role,
    address,
    provider,
    social_id,
    profile_image_url,
  });

  return newUser;
};

export default { signup };