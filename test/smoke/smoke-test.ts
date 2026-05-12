import http from 'k6/http';
import { check, sleep } from 'k6';
import type { Options } from 'k6/options';
import { ENV } from '../../config/environments';
import { ENDPOINTS } from '../../config/endpoints';
import { login } from '../../helpers/auth';
import { jsonHeaders } from '../../helpers/utils';

export const options: Options = {
    vus: 1,
    duration: '30s',
    thresholds: {
        http_req_duration: ['p(95)<800'],
        http_req_failed: ['rate<0.01'],
        checks: ['rate>0.99']
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
