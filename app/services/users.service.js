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

/**
 * 내 정보 조회
 */
const getMe = async (userId) => {
  const user = await usersRepository.findUserById(userId);

  if (!user) {
    throw new Error("USER_NOT_FOUND");
  }

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    phoneNumber: user.phoneNumber,
  };
};

/**
 * 내 정보 수정
 */
const updateMe = async (userId, updateDto) => {
  const user = await usersRepository.findUserById(userId);

  if (!user) {
    throw new Error("USER_NOT_FOUND");
  }

  // 필요한 필드만 업데이트
  if (updateDto.name !== undefined) {
    user.name = updateDto.name;
  }
  if (updateDto.email !== undefined) {
    user.email = updateDto.email;
  }
  if (updateDto.phoneNumber !== undefined) {
    user.phoneNumber = updateDto.phoneNumber;
  }

  await usersRepository.save(user);

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    phoneNumber: user.phoneNumber,
  };
};

const checkEmailDuplicate = async (email) => {
  const user = await usersRepository.findUserByEmail(email);
  return !!user;
};

/**
 * 회원탈퇴 (soft delete)
 */
const withdrawUser = async (userId) => {
  const user = await usersRepository.findUserById(userId);

  if (!user) {
    throw new Error("존재하지 않는 사용자입니다.");
  }

  // soft delete (deletedAt 자동 세팅)
  await user.destroy();

  return true;
};

export default { processKakaoUser, getMe, updateMe, checkEmailDuplicate, withdrawUser };