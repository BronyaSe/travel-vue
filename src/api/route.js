import request from "@/utils/request.js";
import qs from "qs";

export const routeLoadService = (page) => {
    const params = qs.stringify(page, {
      encode: true,
      indices: true,
    });
    return request.post("/route/GetPage", params);
  }
export const getRouteByIdService = (id)=>{
  return request.get("/route/getdetail/"+id)
}
export const getratingcountByIdService = (id)=>{
  return request.get("/route/getroutecount/"+id)
}
export const routecommentLoadService = (page) =>{
  const params = qs.stringify(page, {
    encode: true,
    indices: true,
  });
  return request.post("/route/GetRouteComment", params);
}
export const addfavoriteService = (routeId) => {
  const formdata = {
    routeId: routeId,
  };
  const params = qs.stringify(formdata, {
    encode: true,
    indices: true,
  });
  return request.post("/route/addfavorite", params);
}
