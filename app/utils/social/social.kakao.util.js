/**
 * @file app/utils/social/social.kakao.util.js
 * @description 카카오 소셜 유틸리티
 * 251222 v1.0.0 Lee init
 */

/**
 * 카카오 인가 코드 발급 URL 생성
 * @return {string} URL
 */
function getAuthorizeUrl(client) {
  const params = {
    client_id: process.env.SOCIAL_KAKAO_REST_API_KEY,
    redirect_uri: `${process.env.APP_URL}${process.env.SOCIAL_KAKAO_CALLBACK_URL}`,
    response_type: "code", // code로 고정
    // TODO: 나중에 다시 살리자 up || 귀찮으면 다시 죽이자 down.
    prompt: "login", // 지울 시 매 로그인 필요 X
    state: client,
  };

  const queryParams = new URLSearchParams(params).toString(); // 객체를 query parameter URL형태로 변경

  return `${process.env.SOCIAL_KAKAO_API_URL_AUTHORIZE}?${queryParams}`;
}

function getTokenRequest(code) {
  const headers = {
    "Content-Type": "application/x-www-form-urlencoded;charset=utf-8",
  };

  const params = {
    grant_type: "authorization_code",
    client_id: process.env.SOCIAL_KAKAO_REST_API_KEY,
    redirect_uri: `${process.env.APP_URL}${process.env.SOCIAL_KAKAO_CALLBACK_URL}`,
    code: code,
  };

  const searchParams = new URLSearchParams(params);

  return { headers, searchParams };
}

function getUserRequest(token) {
  const headers = {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/x-www-form-urlencoded;charset=utf-8",
  };

  const params = {
    secure_resource: true,
  };

  const searchParams = new URLSearchParams(params);

  return { headers, searchParams };
}

function getLogOutRequest(id, token) {
  const headers = {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/x-www-form-urlencoded;charset=utf-8",
  };

  const params = {
    target_id_type: "user_id",
    target_id_type: id,
  };

  const searchParams = new URLSearchParams(params);

  return { headers, searchParams };
}

export default {
  getAuthorizeUrl,
  getTokenRequest,
  getUserRequest,
  getLogOutRequest,
};
