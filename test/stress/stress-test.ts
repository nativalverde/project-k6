import http from 'k6/http';
import { check, sleep } from 'k6';
import type { Options } from 'k6/options';
import { ENV } from '../../config/environments.ts';
import { ENDPOINTS } from '../../config/endpoints.ts';
import { login } from '../../helpers/auth.ts';
import { jsonHeaders } from '../../helpers/utils.ts';

export const options: Options = {
    stages: [
        { duration: '20s', target: 30 },
        { duration: '30s', target: 30 },
        { duration: '20s', target: 50 },
        { duration: '30s', target: 50 },
        { duration: '20s', target: 100 },
        { duration: '30s', target: 100 },
        { duration: '30s', target: 0 },
    ],
    thresholds: {
        http_req_duration: ['p(95)<3000'],
        http_req_failed: ['rate<0.10'],
    },
};

export default function (): void {

    const token = login();
    check(token, {
        'login return token': (t) => t !==null && t.length > 0,
    });

    if (!token) {
        sleep(1);
        return
    }

    sleep(1);

    // 2 blog publico
    const postsRes = http.get(`${ENV.BASE_URL}${ENDPOINTS.BLOG.PUBLIC_POSTS}?per_page=50`, {headers: jsonHeaders} );
    check(postsRes, {
        'post status 200': (r) => r.status === 200,
        'posts response time < 800 ms': (r) => r.timings.duration < 800,
    })
    sleep(1);

};