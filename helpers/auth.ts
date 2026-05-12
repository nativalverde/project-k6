import http from 'k6/http';
import { check } from 'k6';

import { ENV } from '../config/environments';
import { ENDPOINTS } from '../config/endpoints';
import type { LoginPayload, LoginResponse } from '../types/index';
import { jsonHeaders } from './utils';


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
    
    const body = res.json() as unknown as LoginResponse;
    return body?.access_token || null;
};