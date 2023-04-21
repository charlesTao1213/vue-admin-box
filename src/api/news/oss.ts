import request from "@/utils/system/request";

import axios, { AxiosRequestConfig, AxiosResponse } from "axios";
import { UploadUserFile } from "element-plus";


// let baseUrl = "/api"
// let baseUrl = "https://api.dianxiao.feedadx.com/dianxiao"
let baseUrl = "http://10.106.0.172:8080"

export function getSign(contentType: number) {
  return  axios.get(baseUrl+"/news/ossSign?contentType=" + contentType)
}

export function sendFile(data: FormData, contentType: number) {
  return  axios.post(baseUrl+"/news/uploadFile?contentType=" + contentType,data)

}