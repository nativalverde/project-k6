import http from 'k6/http';
import { check, sleep } from 'k6';
import type { Options } from 'k6/options';
import { ENV } from '../../config/environments.ts';
import { ENDPOINTS } from '../../config/endpoints.ts';
import { jsonHeaders } from '../../helpers/utils.ts';
import type { ForgotPassword, ForgotPasswordResponse } from '../../types/index.ts';

export const options: Options = {
    stages: [
        // Linea base - carga mínima para referencia
        { duration: '20s', target: 10 },
        { duration: '20s', target: 10 },
        // Incremento progresivo - buscando punto de degradación
        { duration: '20s', target: 30 },
        { duration: '30s', target: 30 },
        { duration: '20s', target: 50 },
        { duration: '30s', target: 50 },
        { duration: '20s', target: 80 },
        { duration: '30s', target: 80 },
        { duration: '20s', target: 100 },
        { duration: '30s', target: 100 },
        { duration: '20s', target: 150 },
        { duration: '30s', target: 150 },
        // Rampa de bajada verificar estabilidad post-estrés
        { duration: '30s', target: 0 },
    ],
    thresholds: {
        http_req_duration: ['p(95)<3000'],
        http_req_failed: ['rate<0.010'],
        checks: ['rate>0.99']
    },
};


export default function (): void {

    const payload: ForgotPassword = { email: ENV.TEST_USER_EMAIL};

    const forgotRes = http.post(
        `${ENV.BASE_URL}${ENDPOINTS.AUTH.FORGOT_PASSWORD}`, JSON.stringify(payload),{ headers: jsonHeaders}
    );

    check(forgotRes, {
        'forgot_password status 200': (r) => r.status === 200,
        'forgot_password response time < 3000': (r) => r.timings.duration < 3000,
        'forgot_password has message': (r) => {
            const body = r.json() as ForgotPasswordResponse;
            return body?.message !== undefined && body.message.length > 0;
        },
    });

    sleep(1);

};