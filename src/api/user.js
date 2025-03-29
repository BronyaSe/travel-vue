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
  const params = qs.stringify(id,{
    encode: true,
    indices: true,
  })
  return request.post("/user/getUser",params)
}
export const userLogoff = () =>{
    return request.post("/user/logoff")
}
export const userUpdatePwd=(date)=>{
  const params = qs.stringify(date,{
    encode:true,
    indices:true
  })
  return request.post("/user/updatepwd",params)
}
