import http from 'k6/http';
import { check, sleep } from 'k6';
import type { Options } from 'k6/options';
import { ENV } from '../../config/environments.ts';
import { ENDPOINTS } from '../../config/endpoints.ts';
import { login } from '../../helpers/auth.ts';
import { jsonHeaders } from '../../helpers/utils.ts';

export const options: Options = {
    stages: [
        // Rampa de subida — entrada gradual de usuarios
        { duration: '1m',   target: 30 },
        // Carga constante prolongada — detectar fugas de memoria y degradación
        { duration: '10m',  target: 30 },
        // Rampa de bajada
        { duration: '1m',   target: 0 },
    ],
    thresholds: {
        // Bajo carga prolongada el p(95) no debe superar 2.5s
        http_req_duration: ['p(95)<2500'],
        // Tasa de error muy baja — el soak test exige estabilidad
        http_req_failed: ['rate<0.02'],
        // 98% de checks deben pasar durante toda la ejecución
        checks: ['rate>0.98'],
    },
};

export default function (): void {

    // Paso 1 — Login: obtener token de autenticación
    const token = login();
    check(token, {
        'login retorna token': (t) => t !== null && t !== undefined && t.length > 0,
    });

    if (!token) {
        sleep(1);
        return;
    }

    const authHeaders = {
        ...jsonHeaders,
        Authorization: `Bearer ${token}`,
    };

    sleep(1);

    // Paso 2 — GET /v1/auth/me: validar persistencia del token bajo carga continua
    const meRes = http.get(
        `${ENV.BASE_URL}${ENDPOINTS.AUTH.ME}`,
        { headers: authHeaders }
    );
    check(meRes, {
        'auth/me status 200': (r) => r.status === 200,
        'auth/me response time < 2500ms': (r) => r.timings.duration < 2500,
        'auth/me retorna email': (r) => {
            const body = r.json() as Record<string, unknown>;
            return body?.email !== undefined;
        },
    });

    sleep(1);

    // Paso 3 — GET /v1/courses: listar cursos — detectar degradación de lectura prolongada
    const coursesRes = http.get(
        `${ENV.BASE_URL}${ENDPOINTS.COURSE.LIST}`,
        { headers: authHeaders }
    );
    check(coursesRes, {
        'courses status 200': (r) => r.status === 200,
        'courses response time < 2500ms': (r) => r.timings.duration < 2500,
        'courses retorna array': (r) => Array.isArray(r.json()),
    });

    sleep(1);

    // Paso 4 — GET /v1/progress/me: monitorear estabilidad del progreso bajo carga sostenida
    const progressRes = http.get(
        `${ENV.BASE_URL}${ENDPOINTS.PROGRESS.ME}`,
        { headers: authHeaders }
    );
    check(progressRes, {
        'progress status 200': (r) => r.status === 200,
        'progress response time < 2500ms': (r) => r.timings.duration < 2500,
        'progress has body': (r) => r.body !== null && r.body !== '',
    });

    sleep(1);
}
