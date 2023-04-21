import axios from "axios";


// let baseUrl = "https://api.dianxiao.feedadx.com/dianxiao"
let baseUrl = "http://10.106.0.172:8080";


export function getData(params: object, data: object) {
  return axios.post(baseUrl + "/newsLink/list", data);
}

export function create(data: object) {
  return axios.post(baseUrl + "/newsLink/create", data);
}

export function createByOriginUrl(param: string) {
  return axios.get(baseUrl + "/newsAdmin/createByOriginUrl?" + param);
}


