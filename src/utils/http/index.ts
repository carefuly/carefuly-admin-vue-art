import axios, {InternalAxiosRequestConfig, AxiosRequestConfig, AxiosResponse} from 'axios'
import NProgress from "./nprogress";
import {useUserStore} from '@/store/modules/user'
import {ApiStatus} from './status'
import {skyMsgError, skyNoticeError} from "@/utils";
import {HttpError, showError} from "@/utils/http/error";

// 常量定义
const LOGOUT_DELAY = 1000 // 退出登录延迟时间(毫秒)
const MAX_RETRIES = 2 // 最大重试次数
const RETRY_DELAY = 1000 // 重试延迟时间(毫秒)

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_GLOB_API_URL + import.meta.env.VITE_GLOB_API_URL_PREFIX, // API地址
  timeout: import.meta.env.VITE_TIMEOUT, // 请求超时时间(毫秒)
  withCredentials: false, // 异步请求携带cookie
  headers: {
    get: {'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8'},
    post: {'Content-Type': 'application/json;charset=utf-8'}
  },
});

// 请求拦截器
axiosInstance.interceptors.request.use(
  (request: InternalAxiosRequestConfig) => {
    // 1. 请求开始
    NProgress.start();
    // 获取token
    const {accessToken} = useUserStore();
    // 如果实现挤下线功能，需要用户绑定一个uuid，uuid发生变化，token失效
    if (accessToken) {
      request.headers['Authorization'] = "Bearer " + accessToken;
    }
    // 2. 请求结束
    NProgress.done();
    // 返回修改后的配置
    return request;
  },
  error => {
    // 2. 请求结束
    NProgress.done();
    error.data = {};
    error.data.msg = "服务器异常，请联系管理员🌻";
    return error;
  });

// 响应拦截器
axiosInstance.interceptors.response.use(
  (response: AxiosResponse) => {
    const {code, msg} = response.data;

    if (code === ApiStatus.success) {
      return response.data;
    } else if (code === ApiStatus.unauthorized) {
      // 401 未登录
      skyNoticeError(`登录已过期，请重新登录🌻`);
      logOut();
      return Promise.reject(msg);
    } else if ([400, 403, 500].includes(code)) {
      skyMsgError(msg || "服务器偷偷跑到火星去玩了🌻");
      return Promise.reject(msg || "服务器偷偷跑到火星去玩了🌻");
    } else {
      return response.data;
    }
  },
  error => {
    // 2. 请求结束
    NProgress.done();
    // 处理网络错误，不是服务器响应的数据
    error.data = {};
    if (error && error.response) {
      switch (error.response.status) {
        case 400:
          error.data.msg = "错误请求🌻";
          skyMsgError(error.data.msg);
          break;
        case 401:
          error.data.msg = "未授权，请重新登录🌻";
          skyMsgError(error.data.msg);
          break;
        case 403:
          error.data.msg = "对不起，您没有权限访问🌻";
          skyMsgError(error.data.msg);
          break;
        case 404:
          error.data.msg = "请求错误,未找到请求路径🌻";
          skyMsgError(error.data.msg);
          break;
        case 405:
          error.data.msg = "请求方法未允许🌻";
          skyMsgError(error.data.msg);
          break;
        case 408:
          error.data.msg = "请求超时🌻";
          skyMsgError(error.data.msg);
          break;
        case 500:
          error.data.msg = "服务器又偷懒了，请重试🌻";
          skyMsgError(error.data.msg);
          break;
        case 501:
          error.data.msg = "网络未实现🌻";
          skyMsgError(error.data.msg);
          break;
        case 502:
          error.data.msg = "网络错误🌻";
          skyMsgError(error.data.msg);
          break;
        case 503:
          error.data.msg = "服务不可用🌻";
          skyMsgError(error.data.msg);
          break;
        case 504:
          error.data.msg = "网络超时🌻";
          skyMsgError(error.data.msg);
          break;
        case 505:
          error.data.msg = "http版本不支持该请求🌻";
          skyMsgError(error.data.msg);
          break;
        default:
          error.data.msg = `连接错误${error.response.status}`;
          skyMsgError(error.data.msg);
      }
    } else {
      error.data.msg = "连接到服务器失败🌻";
      skyMsgError(error.data.msg);
    }
    return Promise.reject(error);
  },
);

// 扩展 AxiosRequestConfig 类型
interface ExtendedAxiosRequestConfig extends AxiosRequestConfig {
  showErrorMessage?: boolean
}

// 请求函数
async function request<T = any>(config: ExtendedAxiosRequestConfig): Promise<T> {
  // 对 POST | PUT 请求特殊处理
  if (config.method?.toUpperCase() === 'POST' || config.method?.toUpperCase() === 'PUT') {
    if (config.params && !config.data) {
      config.data = config.params;
      config.params = undefined;
    }
  }

  try {
    const res = await axiosInstance.request<Api.Http.BaseResponse<T>>(config)
    return res as T
  } catch (error) {
    if (error instanceof HttpError) {
      // 根据配置决定是否显示错误消息
      const showErrorMessage = config.showErrorMessage !== false
      showError(error, showErrorMessage)
    }
    return Promise.reject(error)
  }
}

// 判断是否需要重试
function shouldRetry(statusCode: number): boolean {
  return [
    ApiStatus.requestTimeout,
    ApiStatus.internalServerError,
    ApiStatus.badGateway,
    ApiStatus.serviceUnavailable,
    ApiStatus.gatewayTimeout
  ].includes(statusCode)
}

// 请求重试函数
async function retryRequest<T>(
  config: ExtendedAxiosRequestConfig,
  retries: number = MAX_RETRIES
): Promise<T> {
  try {
    return await request<T>(config)
  } catch (error) {
    if (retries > 0 && error instanceof HttpError && shouldRetry(error.code)) {
      await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY))
      return retryRequest<T>(config, retries - 1)
    }
    throw error
  }
}

// API 方法集合
const api = {
  get<T>(c: any): Promise<T> {
    return retryRequest({...c, method: 'GET'}) // GET 请求
  },
  post<T>(c: any): Promise<T> {
    return retryRequest({...c, method: 'POST'}) // POST 请求
  },
  put<T>(c: any): Promise<T> {
    return retryRequest({...c, method: 'PUT'}) // PUT 请求
  },
  del<T>(c: any): Promise<T> {
    return retryRequest({...c, method: 'DELETE'}) // DELETE 请求
  },
  request<T>(c: any): Promise<T> {
    return retryRequest({...c}) // 通用请求
  }
}

// 退出登录函数
const logOut = (): void => {
  setTimeout(() => {
    useUserStore().logOut()
  }, LOGOUT_DELAY)
}

export default api;
