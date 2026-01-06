/**
 * 페이지네이션 응답 객체를 생성합니다.
 * @param {number} page - 현재 페이지
 * @param {number} limit - 페이지 당 항목 수
 * @param {number} totalItems - 전체 항목 수
 * @param {Array<object>} items - 현재 페이지의 항목 배열
 * @returns {{items: Array<object>, pagination: object}}
 */
export const buildPaginatedResponse = (page, limit, totalItems, items) => {
    const totalPages = Math.ceil(totalItems / limit);
    return {
        items,
        pagination: {
            currentPage: page,
            pageSize: limit,
            totalItems,
            totalPages,
            hasNextPage: page < totalPages,
            hasPrevPage: page > 1,
        }
    };
};
