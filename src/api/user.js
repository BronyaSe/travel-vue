import request from "@/utils/request.js";
import qs from "qs";

export const userRegService = (regData) => {
  const params = qs.stringify(regData, {
    encode: true,
    indices: true,
  });
  return request.post("/user/register", params);
};
export const userSendCodeService = (user) => {
  const target = {
    email: user.email,
  };
  const params = qs.stringify(target);
  return request.post("/user/SendVerifyCode", params);
};
export const userLoginservice = (user) => {
    const params = qs.stringify(user,{
        encode: true,
        indices: true,
      }
    )
    return request.post("/user/login",params)
}
export const getUserService = (id) => {
  return request.get("/user/getUser",{
    params: { id: id },
  });
};
export const userLogoff = () =>{
    return request.post("/user/logoff",null,{ skipGlobalError: true })
}
export const userUpdatePwd=(date)=>{
  const params = qs.stringify(date,{
    encode:true,
    indices:true
  })
  return request.post("/user/updatepwd",params)
}
export const userUpdateInfo=(form,file)=>{
  const formData = new FormData()
  const jsonBlob = new Blob([JSON.stringify(form)], { type: "application/json" });
  formData.append("user", jsonBlob);
  if(file){
    formData.append("file",file)
  }
  return request.post("/user/updateinfo", formData, {
    headers: {
      "Content-Type": "multipart/form-data"
    }
  })
}
export const getUserFavoritesByPage = (page) => {
  return request.get("/user/getFavoriteByPage", {params:page});
}
export const deleteUserFavorites = (id) => {
  const params = {
    id: id,
  };
  return request.delete("/user/deleteFavorite",{params});
}