

export const ENDPOINTS = {

    AUTH: {
        LOGIN: '/v1/auth/login',
        FORGOT_PASSWORD: '/v1/auth/forgot-password',
    },
    BLOG: {
        PUBLIC_POSTS: '/v1/blog/public/posts',
    },
    COURSE: {
        GET_BY_SLUG: ( slug: string ) => `/v1/courses/${slug}`,
    }
}