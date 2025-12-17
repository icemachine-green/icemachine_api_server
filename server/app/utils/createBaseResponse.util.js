/**
 * @file app/utils/createBaseResponse.util.js
 * @description 기본 응답 생성 유틸리티
 * 251216 v1.0.0 Lee init
 */

/**
 * 기본 응답 객체 설정
 * @param {import('../../configs/responseCode.config.type.js').ResponseCodeConfig} codeInfo - 응답 코드 설정 객체
 * @param {null|[]|{}} data
 * @returns {import('./createBaseResponse.util.type.js').CreateBaseResponse} 최종 응답 객체
 */

export function createBaseResponse(codeInfo, data = null) {
  // codoInfo 파라미터: responseCode.config.js의 객체를 인자로 받음
  // data 파라미터: 안 받을시 기본값 = null
  const responseData = {
    code: codeInfo.code,
    msg: codeInfo.info,
  };
  if (data) {
    responseData.data = data;
  }

  return responseData;
}
