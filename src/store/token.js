import { defineStore } from "pinia";
import { ref } from "vue";

export const useTokenStore = defineStore("token" , ()=>{
    const token = ref('')
    
    const setToken=(Newtoken)=>{
        token.value=Newtoken
    }

    const removeToken=()=>{
        token.value=''
    }

    return {token,setToken,removeToken}
},{
    persist:true
}

)