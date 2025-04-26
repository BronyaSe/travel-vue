import request from "@/utils/request.js";
import qs from "qs";

export const getRouteByPage = (page) =>{
    const params = qs.stringify(page, {
      encode: true,
      indices: true,
    });
    return request.post("/admin/getAllRouteByPage", params);
  }
export const updateRouteInfo = (route,cover,detailpic) => {
  const formData = new FormData()
  const jsonBlob = new Blob([JSON.stringify(route)], { type: "application/json" });
  formData.append("route", jsonBlob);
  if(cover){
    formData.append("cover",cover)
  }
  if (detailpic && detailpic.length) {
    detailpic.forEach(file => {
      formData.append("detail", file);
    });
  }
  return request.post("/admin/updateDetail", formData, {
    headers: {
      "Content-Type": "multipart/form-data"
    }
  })
}
export const deleteByUrl = (url, id) => {
  const query = qs.stringify({ url, id }, { encode: true, indices: true });
  return request.delete(`/admin/deleteDetailPic?${query}`);
}