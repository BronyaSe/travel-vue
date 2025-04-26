import axios from "axios";
import { useTokenStore } from "@/store/token";
import  router from '@/router'
import { ElMessage, ElMessageBox } from 'element-plus'

const baseURL = "https://nas.bronyahan.top:30022/api/";
// const baseURL = "http://pc.bronyahan.top:8080/";
const instance = axios.create({ baseURL: baseURL });

// import { useTokenStore } from '@/store/token'
// const tokenStore = useTokenStore();

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
    else if(res.data.code===500){
      ElMessage.error(res.data.msg)
    }
    ElMessage.error('服务异常')
    return Promise.reject(res.data)
  },
  error => {
        // 如果配置了 skipGlobalError，则直接 reject，不弹出消息
        if (error.config && error.config.skipGlobalError) {
          return Promise.reject(error);
        }
    if(error.response.status===401){
      if(error.response.data.error==="请登录"){
      ElMessage.error("请先登录")
      router.push("/login")
    }else if(error.response.data.error==="请重新登录"){
      ElMessage.error("登录过期！请重新登录")
      // tokenStore.clearToken()
    }else if(error.response.data.error==="验证失败，请重新登陆"){
      ElMessage.error("验证失败，请重新登陆")
      // tokenStore.clearToken()
    }
    return Promise.reject(error);
  }
});
export default instance;
