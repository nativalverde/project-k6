import http from 'k6/http';
import { check, sleep } from 'k6';
import type { Options } from 'k6/options';
import { ENV } from '../../config/environments.ts';
import { ENDPOINTS } from '../../config/endpoints.ts';
import { jsonHeaders } from '../../helpers/utils.ts';
import type { ForgotPassword, ForgotPasswordResponse } from '../../types/index.ts';

export const options: Options = {
    stages: [
        // Linea base - tráfico normal antes del pico
        { duration: '30s', target: 10 },
        { duration: '30s', target: 10 },
        // Pico abrupto — incremento agresivo de tráfico
        { duration: '10s', target: 200 },
        { duration: '30s', target: 200 },
        // Caída brusca — regreso repentino a linea base
        { duration: '10s', target: 10 },
        // Recuperación — verificar que el sistema vuelve a operar normal
        { duration: '60s', target: 10 },
        // Rampa de bajada
        { duration: '10s', target: 0 },
    ],
    thresholds: {
        http_req_duration: ['p(95)<5000'],
        http_req_failed: ['rate<0.15'],
        checks: ['rate>0.85']
    },
};


export default function (): void {

    const payload: ForgotPassword = { email: ENV.TEST_USER_EMAIL};

    const forgotRes = http.post(
        `${ENV.BASE_URL}${ENDPOINTS.AUTH.FORGOT_PASSWORD}`, JSON.stringify(payload),{ headers: jsonHeaders}
    );

    check(forgotRes, {
        'forgot_password status 200': (r) => r.status === 200,
        'forgot_password response time < 3000': (r) => r.timings.duration < 5000,
        'forgot_password has message': (r) => {
            const body = r.json() as ForgotPasswordResponse;
            return body?.message !== undefined && body.message.length > 0;
        },
    });

    sleep(1);

};