import http from 'k6/http';
import { check } from 'k6';

import { ENV } from '../config/environments.ts';
import { ENDPOINTS } from '../config/endpoints.ts';
import type { LoginPayload, LoginResponse } from '../types/index.ts';
import { jsonHeaders } from './utils.ts';


export function login (
    email: string = ENV.TEST_USER_EMAIL,
    password: string = ENV.TEST_USER_PASSWORD,
): string | null {
    const payload: LoginPayload = {email, password};
    const res = http.post(`${ENV.BASE_URL}${ENDPOINTS.AUTH.LOGIN}`,JSON.stringify(payload),{headers: jsonHeaders})

    const ok = check(res, {
        'login status is 200' : (r) => r.status === 200,
        'login has body' : (r) => r.body !== null && r.body !== '',
    });

    if (!ok || res.status !== 200) {
        return null;
    }
    
    const body = res.json() as LoginResponse;
    return body?.access_token || null;
};