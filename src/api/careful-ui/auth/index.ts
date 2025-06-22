// 导入二次封装axios
import request from "@/utils/http";
import {BaseResponse} from '@/types/api';

// 统一管理接口
enum API {
  REGISTER = "/v1/auth/register",
  LOGIN = "/v1/auth/login",
  REFRESH_TOKEN = "/v1/auth/refresh-token",
  LOGOUT = "/v1/auth/logout",
  USERINFO = "/v1/auth/userinfo",
  CHANGE_PASSWORD = "/v1/auth/change-password",
}

interface RegisterParams {
  username: string
  password: string
}

interface LoginParams {
  userName: string
  password: string
}

export class AuthService {
  // 注册
  static async register(data: RegisterParams) {
    return await request.post<BaseResponse>({
      url: API.REGISTER,
      data,
    });
  }

  // 登录
  static async login(data: LoginParams) {
    return await request.post<BaseResponse>({
      url: API.LOGIN,
      data,
    });
  }

  // 注销
  static async logout() {
    return await request.post<BaseResponse>({
      url: API.LOGOUT,
    });
  }

  // 用户信息
  static async userinfo() {
    return await request.get<BaseResponse>({
      url: API.USERINFO,
    });
  }
}

// // 登录
// export const login = (data: any) => sky.post(API.LOGIN, data);
//
// // 多用户类型登录
// export const typeLogin = (data: any) => sky.post(API.TYPE_LOGIN, data);
//
// // 刷新令牌
// export const refreshToken = (data: any) => sky.post(API.REFRESH_TOKEN, data);
//
// // 注销
// export const logout = () => sky.post(API.LOGOUT);
//
// // 用户信息
// export const userinfo = () => sky.post(API.USERINFO);
//
// //修改密码
// export const changePassword = (data: any) => sky.post(API.USERINFO, data);
