/**
 * @file app/utils/cookie/cookie.util.js
 * @description 쿠키 유틸리티
 * 251216 v1.0.0 Lee init
 */

import dayjs from "dayjs";

// ----------------
// private
// ----------------
/**
 *
 * @param {import('express').Response} res
 * @param {string} cookieName
 * @param {string} cookieValue
 * @param {number} ttl
 * @param {boolean} httpOnlyFlg
 * @param {boolean} secureFlg
 * @param {string|null} path
 */
function setCookie(
  res,
  cookieName,
  cookieValue,
  ttl,
  httpOnlyFlg = true,
  secureFlg = false,
  path = null
) {
  const options = {
    expires: dayjs().add(ttl, "second").toDate(),
    httpOnly: httpOnlyFlg,
    secure: secureFlg,
    sameSite: "none", // domain 검증 실행 여부
  };

  if (path) {
    options.path = path;
  }

  console.log("Setting cookie with options:", options); // DEBUGGING

  res.cookie(cookieName, cookieValue, options);
}

/**
 * 특정 쿠키 획득 (미존재 시 빈문자열 반환)
 * @param {import('express').Request} req
 * @param {string} cookieName
 * @returns {string}
 */
function getCookie(req, cookieName) {
  let cookieValue = "";
  // req.cookies = express 자동 생성 쿠키 객체
  if (req.cookies) {
    cookieValue = req.cookies[cookieName];
  }

  return cookieValue;
}

/**
 * 쿠키 제거
 * @param {import('express').Response} res
 * @param {string} cookieName
 * @param {boolean} httpOnlyFlg
 * @param {boolean} secureFlg
 * @param {string|null} path
 */
function clearCookie(
  res,
  cookieName,
  httpOnlyFlg = true,
  secureFlg = false,
  path = null
) {
  const options = {
    httpOnly: httpOnlyFlg,
    secure: secureFlg,
    sameSite: "none",
  };

  if (path) {
    options.path = path;
  }

  res.clearCookie(cookieName, options);
}

// ----------------
// public
// ----------------
/**
 * 쿠키에 리프래시 토큰 설정
 * @param {import('express').Reponse} res
 * @param {string} refreshToken
 */
function setCookieRefreshToken(res, refreshToken) {
  setCookie(
    res,
    process.env.JWT_REFRESH_TOKEN_COOKIE_NAME,
    refreshToken,
    parseInt(process.env.JWT_REFRESH_TOKEN_COOKIE_EXPIRY),
    true, // secureFlg
    true,
    process.env.JWT_REISSUE_URI
  );
}

/**
 * 쿠키에서 refresh (리프래시) token 획득
 * @param {import('express').Request} req
 * @returns {string}
 */
function getCookieRefreshToken(req) {
  return getCookie(req, process.env.JWT_REFRESH_TOKEN_COOKIE_NAME);
}

/**
 * 리프래시 토큰 쿠키 제거
 */
function clearCookieRefreshToken(res) {
  clearCookie(
    res,
    process.env.JWT_REFRESH_TOKEN_COOKIE_NAME,
    true,
    true,
    process.env.JWT_REISSUE_URI
  );
}

// --- Admin-specific cookie functions ---

/**
 * 쿠키에 관리자용 리프레시 토큰 설정
 * @param {import('express').Reponse} res
 * @param {string} refreshToken
 */
function setAdminCookieRefreshToken(res, refreshToken) {
  setCookie(
    res,
    process.env.JWT_REFRESH_TOKEN_COOKIE_NAME, // 쿠키 이름은 동일하게 사용
    refreshToken,
    parseInt(process.env.JWT_REFRESH_TOKEN_COOKIE_EXPIRY),
    true, // httpOnly
    false, // secureFlg (로컬 테스트를 위해 false로 설정)
    '/api/admin/reissue' // 관리자용 재발급 경로
  );
}

/**
 * 관리자용 리프레시 토큰 쿠키 제거
 */
function clearAdminCookieRefreshToken(res) {
  clearCookie(
    res,
    process.env.JWT_REFRESH_TOKEN_COOKIE_NAME,
    true,
    false, // secureFlg (로컬 테스트를 위해 false로 설정)
    '/api/admin/reissue' // 관리자용 재발급 경로
  );
}


export default {
  setCookieRefreshToken,
  getCookieRefreshToken,
  clearCookieRefreshToken,
  setAdminCookieRefreshToken,
  clearAdminCookieRefreshToken,
};
