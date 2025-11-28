import AxiosInit from "../api/axiosInstance";
export const sendMessageServices =async (data)=>{
    const result = await AxiosInit.post('/addmsg',data);
    return result.data;
}
export const GetMessageServices = async(data)=>{
    const result = await AxiosInit.post('/getmsg',data);
    return result.data;
}