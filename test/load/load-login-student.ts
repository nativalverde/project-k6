import http from 'k6/http';
import { check, sleep } from 'k6';
import type { Options } from 'k6/options';
import { ENV } from '../../config/environments.ts';
import { ENDPOINTS } from '../../config/endpoints.ts';
import { login } from '../../helpers/auth.ts';
import { jsonHeaders } from '../../helpers/utils.ts';

export const options: Options = {
    stages: [
        // Rampa de subida — simula usuarios entrando gradualmente
        { duration: '30s', target: 20 },
        // Carga sostenida — carga concurrente esperada en producción
        { duration: '1m',  target: 50 },
        { duration: '1m',  target: 50 },
        // Pico moderado — carga por encima del promedio
        { duration: '30s', target: 80 },
        { duration: '1m',  target: 80 },
        // Rampa de bajada
        { duration: '30s', target: 0 },
    ],
    thresholds: {
        // 95% de requests deben responder en menos de 2s
        http_req_duration: ['p(95)<2000'],
        // Menos del 5% de requests pueden fallar
        http_req_failed: ['rate<0.05'],
        // Al menos 95% de checks deben pasar
        checks: ['rate>0.95'],
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

    // Paso 2 — GET /v1/auth/me: validar que el token funciona y retorna perfil
    const meRes = http.get(
        `${ENV.BASE_URL}${ENDPOINTS.AUTH.ME}`,
        { headers: authHeaders }
    );
    check(meRes, {
        'auth/me status 200': (r) => r.status === 200,
        'auth/me response time < 2000ms': (r) => r.timings.duration < 2000,
        'auth/me retorna email': (r) => {
            const body = r.json() as Record<string, unknown>;
            return body?.email !== undefined;
        },
    });

    sleep(1);

    // Paso 3 — GET /v1/courses: listar cursos disponibles para el estudiante
    const coursesRes = http.get(
        `${ENV.BASE_URL}${ENDPOINTS.COURSE.LIST}`,
        { headers: authHeaders }
    );
    check(coursesRes, {
        'courses status 200': (r) => r.status === 200,
        'courses response time < 2000ms': (r) => r.timings.duration < 2000,
        'courses retorna array': (r) => Array.isArray(r.json()),
    });

    sleep(1);

    // Paso 4 — GET /v1/progress/me: consultar progreso del estudiante autenticado
    const progressRes = http.get(
        `${ENV.BASE_URL}${ENDPOINTS.PROGRESS.ME}`,
        { headers: authHeaders }
    );
    check(progressRes, {
        'progress status 200': (r) => r.status === 200,
        'progress response time < 2000ms': (r) => r.timings.duration < 2000,
        'progress has body': (r) => r.body !== null && r.body !== '',
    });

    sleep(1);
}