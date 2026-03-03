import { http } from "@/lib/http";

const permissionApiRequest = {
    sGetAll: (data: any) => http.post<any>(`/api/permissions`, data),
    // sLogout: () => http.get<any>('/api/auth/logOut'),
    // sMe: () => http.get<any>('/api/auth/me')
}

export default permissionApiRequest;
