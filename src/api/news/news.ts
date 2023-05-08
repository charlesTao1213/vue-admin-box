import axios from "axios";


let baseUrl = "http://api.admin.feedadx.com/admin"
// let baseUrl = "http://10.106.0.172:8080";


export function getData(params: object, data: object) {
  return axios.post(baseUrl + "/newsLink/list", data);
}

export function create(data: object) {
  return axios.post(baseUrl + "/newsLink/create", data);
}

export function createByOriginUrl(param: string) {
  return axios.get(baseUrl + "/newsAdmin/createByOriginUrl?" + param);
}

export function createByHtml(data: Object) {
  return axios.post(baseUrl + "/parseHtml", data);
}

export function getNewsInfo(param: string) {
  return axios.get(baseUrl + "/getNewsInfo?" + param);
}

export function updateNewsInfo(data: object) {
  return axios.post(baseUrl + "/updateNewsInfo", data);
}

