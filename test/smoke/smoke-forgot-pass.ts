//Importa el módulo HTTP de k6. Es lo que te permite hacer peticiones (GET, POST, etc.) dentro del test.
import http from 'k6/http';
//check → función para validar condiciones sobre una respuesta (como assertions)
//sleep → pausa la ejecución del VU X segundos, simula tiempo de espera entre acciones reales de un usuario
import { check, sleep } from 'k6';
//Importa solo el tipo TypeScript de las opciones de k6. No agrega código en runtime, solo le dice a TS cómo debe verse el objeto options.
import type { Options } from 'k6/options';
//Trae la configuración del entorno: BASE_URL, TEST_USER_EMAIL, etc. Centralizado para no hardcodear valores en cada test.
import { ENV } from '../../config/environments.ts';
//Trae el mapa de rutas de la API. En este caso usaremos ENDPOINTS.AUTH.FORGOT_PASSWORD que vale /v1/auth/forgot-password.
import { ENDPOINTS } from '../../config/endpoints.ts';
//Importa los headers reutilizables: content-type: application/json y Accept: application/json. Necesarios para que el API acepte y devuelva JSON.
import { jsonHeaders } from '../../helpers/utils.ts';
//Importa los dos tipos que usamos:
    //ForgotPassword → forma del body que enviamos: { email: string }
    //ForgotPasswordResponse → forma de la respuesta: { message: string }
import type { ForgotPassword, ForgotPasswordResponse } from '../../types/index.ts';

//Configuración del test. vus: 1 significa 1 usuario virtual — es smoke test, mínima carga. duration: '30s' lo corre durante 30 segundos.
export const options: Options = {
    vus: 1,
    duration: '30s',
    /*Criterios de éxito/fallo del test:
    p(95)<800 → el 95% de las requests deben responder en menos de 800ms
    rate<0.01 → menos del 1% de requests pueden fallar
    rate>0.99 → más del 99% de los check() deben pasar
    Si alguno no se cumple, k6 termina con exit code de fallo.*/
    thresholds: {
        http_req_duration: ['p(95)<800'],
        http_req_failed: ['rate<0.01'],
        checks: ['rate>0.99']
    },
};

//La función principal que k6 ejecuta en cada iteración de cada VU. Todo lo que va adentro se repite durante los 30 segundos.
export default function (): void {

    // forgot_password es un endpoint público, no requiere autenticación
    //Construye el body del POST. Usa el tipo ForgotPassword para que TypeScript valide la forma. El email viene de la variable de entorno configurada en environments.ts.
    const payload: ForgotPassword = { email: ENV.TEST_USER_EMAIL};

    //Hace el POST al endpoint. Arma la URL completa concatenando base URL + ruta. JSON.stringify(payload) convierte el objeto a string JSON para enviarlo en el body. Los headers le dicen al servidor que el contenido es JSON.
    const forgotRes = http.post(
        `${ENV.BASE_URL}${ENDPOINTS.AUTH.FORGOT_PASSWORD}`, JSON.stringify(payload),{ headers: jsonHeaders}
    );

    //Valida que el servidor respondió con HTTP 200.
    check(forgotRes, {
        'forgot_password status 200': (r) => r.status === 200,
        //Valida que la respuesta llegó en menos de 800ms. timings.duration es el tiempo total de la request en milisegundos.
        'forgot_password response time < 800': (r) => r.timings.duration < 800,
        //Parsea el body de la respuesta como JSON, lo castea al tipo ForgotPasswordResponse, y verifica que el campo message exista y no esté vacío. Esto confirma que el API devolvió { "message": "If the email exists, instructions have been sent." }.
        'forgot_password has message': (r) => {
            const body = r.json() as ForgotPasswordResponse;
            return body?.message !== undefined && body.message.length > 0;
        },
    });

    //Pausa 1 segundo al final de cada iteración. Simula el tiempo que un usuario real tardaría entre acciones y evita saturar el servidor artificialmente.
    sleep(1);

};