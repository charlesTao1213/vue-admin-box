import request from "@/utils/system/request";
import { AxiosRequestConfig, AxiosResponse } from "axios";

const baseUrl = "";

interface NewsInfo {}

export function getData(params: object, data: object) {
  return request({
    url: "",
    method: "post",
    baseURL: baseUrl,
    params,
    data,
  });
}
