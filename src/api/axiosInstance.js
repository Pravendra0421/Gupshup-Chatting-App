import axios from 'axios';
const baseURL = import.meta.env.VITE_BASE_URL;
const AxiosInit = axios.create({
    baseURL:`${baseURL}/api/v1/`,
    withCredentials:true,
    headers:{
        'Content-Type':'application/json'
    }
});
export default AxiosInit;