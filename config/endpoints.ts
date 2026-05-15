

export const ENDPOINTS = {

    AUTH: {
        LOGIN: '/v1/auth/login',
        FORGOT_PASSWORD: '/v1/auth/forgot-password',
        ME: '/v1/auth/me',
    },
    BLOG: {
        PUBLIC_POSTS: '/v1/blog/public/posts',
    },
    COURSE: {
        LIST: '/v1/courses',
        GET_BY_SLUG: ( slug: string ) => `/v1/courses/${slug}`,
    },
    PROGRESS:{
        ME: '/v1/progress/me',
    },
}