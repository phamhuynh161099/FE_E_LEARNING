import { http } from "@/lib/http";

const videoApiRequest = {
    sGetAll: (data: any) => http.post<any>(`/api/videos`, data),
    // sUpdateRole: (data: any) => http.post<any>(`/api/roles/update-role`, data),
    // sAddRole: (data: any) => http.post<any>(`/api/roles/add-role`, data),
}

export default videoApiRequest;
