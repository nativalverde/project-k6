import type { Environment } from '../types/index';


export const ENV: Environment = {
    BASE_URL: __ENV.BASE_URL || 'https://api.staging.testertestarudo.com',
    TEST_USER_EMAIL: __ENV.TEST_USER_EMAIL || 'mledezma@testertestarudo.com',
    TEST_USER_PASSWORD: __ENV.TEST_USER_PASSWORD || 'travian88',
    TEST_COURSE_SLUG: __ENV.TEST_COURSE_SLUG || 'test'
};
