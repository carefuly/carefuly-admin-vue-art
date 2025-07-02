import axios, {InternalAxiosRequestConfig, AxiosRequestConfig, AxiosResponse} from 'axios';
import type {RequestOptions, ErrorMessageMode} from '@/types/api';
import NProgress from "./nprogress";
import {router} from '@/router';
import {useUserStore} from '@/store/modules/user';
import {useWorktabStore} from '@/store/modules/worktab';
import {resetRouterState} from '@/router/guards/beforeEach';
import EmojiText from '@/utils/ui/emojo';
import {ElMessage} from 'element-plus';
import {ApiStatus} from "@/utils/http/status";
import {skyMsgError, skyNoticeError} from "@/utils/toast";
import {AuthService} from "@/api/careful-ui/auth";
import {RoutesAlias} from "@/router/routesAlias";

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_GLOB_API_URL + import.meta.env.VITE_GLOB_API_URL_PREFIX, // API地址
  timeout: import.meta.env.VITE_TIMEOUT, // 请求超时时间(毫秒)
  withCredentials: false, // 异步请求携带cookie
  // transformRequest: [(data) => JSON.stringify(data)], // 请求数据转换为 JSON 字符串
  // validateStatus: (status) => status >= 200 && status < 300, // 只接受 2xx 的状态码
  headers: {
    get: {'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8'},
    post: {'Content-Type': 'application/json;charset=utf-8'}
  },
  transformResponse: [
    (data, headers) => {
      const contentType = headers['content-type']
      if (contentType && contentType.includes('application/json')) {
        try {
          return JSON.parse(data)
        } catch {
          return data
        }
      }
      return data
    }
  ]
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
  (error) => {
    // 2. 请求结束
    NProgress.done();
    error.data = {};
    error.data.msg = `服务器异常，请联系管理员🌻`;
    return error || Promise.reject(error); // 返回拒绝的 Promise
  }
);

// 响应拦截器
axiosInstance.interceptors.response.use(
  async (response: AxiosResponse) => {
    if (response.data.code === ApiStatus.success) {
      return response;
    } else if (response.data.code === ApiStatus.unauthorized) {
      // 401 未登录
      skyNoticeError(`登录已过期，请重新登录🌻`);
      const userStore = useUserStore();
      await userStore.logOut();
      return Promise.reject(response.data.msg);
    } else if ([400, 403, 500].includes(response.data.code)) {
      skyMsgError(response.data.msg || "服务器偷偷跑到火星去玩了🌻");
      return Promise.reject(response.data.msg || "服务器偷偷跑到火星去玩了🌻");
    } else {
      return response;
    }
  },
  (error) => {
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
  }
);

// 扩展的请求配置接口
interface ExtendedRequestConfig extends AxiosRequestConfig {
  requestOptions?: RequestOptions
}

// 处理请求配置
function processRequestConfig(config: ExtendedRequestConfig): AxiosRequestConfig {
  const {requestOptions, ...axiosConfig} = config;

  // 应用自定义请求选项
  if (requestOptions) {
    // 处理是否携带token
    if (requestOptions.withToken === false) {
      axiosConfig.headers = {...axiosConfig.headers};
      delete axiosConfig.headers?.Authorization;
    }

    // 处理是否添加时间戳
    if (requestOptions.joinTime) {
      const timestamp = Date.now();
      if (axiosConfig.method?.toUpperCase() === 'GET') {
        axiosConfig.params = {...axiosConfig.params, _t: timestamp};
      }
    }

    // 处理API URL
    if (requestOptions.apiUrl) {
      axiosConfig.baseURL = requestOptions.apiUrl;
    }
  }

  return axiosConfig;
}

// 处理错误消息
function handleErrorMessage(error: any, mode: ErrorMessageMode = 'message') {
  if (mode === 'none') return;

  const errorMessage = error.response?.data.msg;
  const message = errorMessage
    ? `${errorMessage} ${EmojiText[500]}`
    : `请求超时或服务器异常！${EmojiText[500]}`;

  if (mode === 'modal') {
    // TODO: 可以使用 ElMessageBox 显示模态框
    skyMsgError(message);
  } else {
    skyMsgError(message);
  }
}

// 请求
async function request<T = any>(config: ExtendedRequestConfig): Promise<T> {
  const processedConfig = processRequestConfig(config);

  // 对 POST | PUT 请求特殊处理
  if (
    processedConfig.method?.toUpperCase() === 'POST' ||
    processedConfig.method?.toUpperCase() === 'PUT'
  ) {
    // 如果已经有 data，则保留原有的 data
    if (processedConfig.params && !processedConfig.data) {
      processedConfig.data = processedConfig.params
      processedConfig.params = undefined // 使用 undefined 而不是空对象
    }
  }

  try {
    const res = await axiosInstance.request<T>(processedConfig)
    return res.data
  } catch (e) {
    if (axios.isAxiosError(e)) {
      // 处理错误消息
      const errorMode = config.requestOptions?.errorMessageMode || 'message'
      handleErrorMessage(e, errorMode)
    }
    return Promise.reject(e)
  }
}

// API 方法集合
const api = {
  get<T>(config: ExtendedRequestConfig): Promise<T> {
    return request({...config, method: 'GET'}) // GET 请求
  },
  post<T>(config: ExtendedRequestConfig): Promise<T> {
    return request({...config, method: 'POST'}) // POST 请求
  },
  put<T>(config: ExtendedRequestConfig): Promise<T> {
    return request({...config, method: 'PUT'}) // PUT 请求
  },
  del<T>(config: ExtendedRequestConfig): Promise<T> {
    return request({...config, method: 'DELETE'}) // DELETE 请求
  },
  request<T>(config: ExtendedRequestConfig): Promise<T> {
    return request({...config}) // 通用请求
  }
}

// 退出登录
const logOut = () => {
  skyNoticeError(`登录已过期，请重新登录🌻`);
  const userStore = useUserStore();
  userStore.setUserInfo({});
  userStore.setLoginStatus(false);
  userStore.setToken("", "");
  router.replace(RoutesAlias.Login);
}

export default api;
