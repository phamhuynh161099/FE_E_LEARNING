import { http } from "@/lib/http";

const userApiRequest = {
    sGetAllUser: (data: any) => http.post<any>(`/api/users`, data),
    sAddNewUser: (data: any) => http.post<any>(`/api/users/add-user`, data),
    sUpdateUser: (data: any) => http.post<any>(`/api/users/update-user`, data),
}

export default userApiRequest;
