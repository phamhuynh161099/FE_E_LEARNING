import { http } from "@/lib/http";

const roleApiRequest = {
    sGetAll: (data: any) => http.post<any>(`/api/roles`, data),
    sUpdateRole: (data: any) => http.post<any>(`/api/roles/update-role`, data),
    sAddRole: (data: any) => http.post<any>(`/api/roles/add-role`, data),
}

export default roleApiRequest;
