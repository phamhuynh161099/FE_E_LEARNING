import { http } from "@/lib/http";

const authApiRequest = {
    sLogin: (data: any) => http.post<any>(`/api/auth/login`, data),
    sLogout: () => http.get<any>('/api/auth/logOut'),
    sMe: () => http.get<any>('/api/auth/me')
}

export default authApiRequest;
