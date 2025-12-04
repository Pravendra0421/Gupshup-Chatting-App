import AxiosInit from "../api/axiosInstance";
export const sendMessageServices =async (data)=>{
    const result = await AxiosInit.post('/addmsg',data);
    return result.data;
}
export const GetMessageServices = async(data)=>{
    const result = await AxiosInit.post('/getmsg',data);
    return result.data;
}
export const getUnreadCounts = async()=>{
    const result = await AxiosInit.get('/unread-counts');
    return result.data;
}
export const markMessageRead = async(senderId)=>{
    const result = await AxiosInit.post('/mark-read',{from:senderId});
    return result.data;
}