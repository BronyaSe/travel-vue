import axios from "axios";
import { useTokenStore } from "@/store/token";
import  router from '@/router'
import { ElMessage, ElMessageBox } from 'element-plus'

const baseURL = "";
const instance = axios.create({ baseURL: baseURL });

instance.interceptors.request.use(
  config=>{
    const tokenStore = useTokenStore();
    if(tokenStore.token){
      config.headers.Authorization = `Bearer ${tokenStore.token}`;
    }
    return config;
  },
  error=>{
    Promise.reject(error)
  }
)


instance.interceptors.response.use(
  res => {
    if(res.data.code==200){
      return res.data;
    }
    if(res.data.code===500){
      ElMessage.error('验证失效，请重新登陆')
      router.push("/login")
    }
    ElMessage.error('服务异常')
    return Promise.reject(res.data)
  },
  error => {
    if(error.response.status===401){
      ElMessage.error("请先登录")
      router.push("/login")
    }
    return Promise.reject(error);
  }
);
export default instance;
