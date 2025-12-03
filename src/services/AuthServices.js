import AxiosInit from "../api/axiosInstance";
export const LoginApi = async(data)=>{
    const response = await AxiosInit.post('login',data);
    return response.data;
}
export const SignupApi = async(data)=>{
    const response = await AxiosInit.post('sign-up',data);
    return response.data;
}
export const GetAllUser = async()=>{
    const response = await AxiosInit.get('all-user');
    return response.data;
}
export const Logout = async()=>{
    const response = await AxiosInit.get('logout');
}