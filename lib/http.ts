import { systemConfig } from "@/configs/system.conf";
import { LOCAL_STORAGE_KEYS } from "@/constants/local-storage.const";
import { normalizePath } from "@/lib/utils";

type CustomOptions = Omit<RequestInit, 'method'> & {
    baseUrl?: string | undefined
}

const ENTITY_ERROR_STATUS = 422
const AUTHENTICATION_ERROR_STATUS = 401

type EnityErrorPayload = {
    message: string
    errors: {
        field: string
        message: string
    }[]
}

export class HttpError extends Error {
    status: number
    payload: {
        message: string
        [key: string]: any
    }

    constructor({ status, payload, message = 'Loi HTTP' }: { status: number; payload: any; message?: string }) {
        super(message)
        this.status = status
        this.payload = payload
    }
}

/**
 * Error cho cac loi thuoc ve sai cac truong thong tin
 */
export class EntityError extends HttpError {
    status: typeof ENTITY_ERROR_STATUS;
    payload: EnityErrorPayload
    constructor({ status, payload }: {
        status: typeof ENTITY_ERROR_STATUS,
        payload: EnityErrorPayload

    }) {
        super({ status, payload, message: 'Loi cac truong thong tin' })
        this.status = status
        this.payload = payload
    }
}

/**
 * Kiểm tra xem file này đang chạy ở Next-Client hay Next-Server
 */
export const isClient = typeof window !== 'undefined'

const request = async <Response>(
    method: 'GET' | 'POST' | 'PUT' | 'DELETE',
    url: string,
    options?: CustomOptions | undefined
) => {
    let body: FormData | string | undefined = undefined
    if (options?.body instanceof FormData) {
        body = options.body
    } else {
        body = JSON.stringify(options?.body)
    }

    const baseHeaders: {
        [key: string]: string
    } =
        body instanceof FormData
            ? {}
            : {
                'Content-Type': 'application/json',
            }

    if (isClient) {
        const accessToken = localStorage.getItem(LOCAL_STORAGE_KEYS.ACCESS_TOKEN);

        const normalizeUrl = normalizePath(url)
        if (accessToken) {
            if (
                normalizeUrl.startsWith('api/auth/login')
                || normalizeUrl === 'api/auth/logOut'
            ) {
            } else {
                baseHeaders['Authorization'] = `Bearer ${accessToken}`
            }
        }
    }


    /**
     * Nếu không truyền BaseUrl hoặc =Undifined thì là gọi BE
     * Nếu truyền thì giá trị , '' -> là gọi NextJS-Server
     */
    const baseUrl = options?.baseUrl === undefined
        ? systemConfig.NEXT_PUBLIC_API_ENDPOINT
        : options.baseUrl;

    const fullUrl = `${baseUrl}${normalizePath(url)}`;

    let res: any = null;
    let payload: Response | null = null

    try {
        res = await fetch(fullUrl, {
            ...options,
            method,
            headers: {
                ...baseHeaders,
                ...options?.headers,
            },
            body,
        });

        payload = await res.json();

    } catch (error) {
        console.error(error)
        if (isClient) {
            localStorage.removeItem(LOCAL_STORAGE_KEYS.ACCESS_TOKEN);
            localStorage.removeItem(LOCAL_STORAGE_KEYS.ZUST_ACCOUNT);
            //!NEED OPEN location.href = '/login';
        } else {
            //** Nothing
        }

        throw new Error('fetch api error')
    }

    const data = {
        status: res.status,
        payload,
    }

    if (!res.ok) {
        if (res.status === ENTITY_ERROR_STATUS) {
            throw new EntityError(data as {
                status: 422
                payload: EnityErrorPayload
            })
        } else if (res.status === AUTHENTICATION_ERROR_STATUS) {
            if (isClient) {
                localStorage.removeItem(LOCAL_STORAGE_KEYS.ACCESS_TOKEN);
                localStorage.removeItem(LOCAL_STORAGE_KEYS.ZUST_ACCOUNT);


                //!NEED OPEN location.href = '/login';
            } else {
                //** Nothing
            }
        } else {
            throw new HttpError(data)
        }
    }


    if (isClient) {
        const normalizeUrl = normalizePath(url)
        if (
            normalizeUrl.startsWith('api/auth/login')
        ) {
            const { accountInfo, tokenInfo: { accessToken } } = (payload as any)

            console.log('in http', accessToken)
            localStorage.setItem(LOCAL_STORAGE_KEYS.ACCESS_TOKEN, accessToken)

        } else if (normalizeUrl === 'api/auth/logOut') {
            localStorage.removeItem(LOCAL_STORAGE_KEYS.ACCESS_TOKEN);
            localStorage.removeItem(LOCAL_STORAGE_KEYS.ZUST_ACCOUNT);
        }
    }

    return data;
}

export const http = {
    get<Response>(
        url: string,
        options?: Omit<CustomOptions, 'body'> | undefined
    ) {
        return request<Response>('GET', url, options);
    },

    post<Response>(
        url: string,
        body: any,
        options?: Omit<CustomOptions, 'body'> | undefined
    ) {
        return request<Response>('POST', url, { ...options, body });
    },

    put<Response>(
        url: string,
        body: any,
        options?: Omit<CustomOptions, 'body'> | undefined
    ) {
        return request<Response>('PUT', url, { ...options, body });
    },

    delete<Response>(
        url: string,
        options?: Omit<CustomOptions, 'body'> | undefined
    ) {
        return request<Response>('DELETE', url, { ...options });
    }
};











