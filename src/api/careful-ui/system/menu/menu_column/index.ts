// 导入二次封装axios
import request from "@/utils/http";
import {BaseResponse} from '@/types/api';

// 统一管理接口
enum API {
  CREATE = "/v1/system/menuColumn/create",
  IMPORT = "/v1/system/menuColumn/import",
  DELETE = "/v1/system/menuColumn/delete/",
  BATCH_DELETE = "/v1/system/menuColumn/delete/batchDelete",
  UPDATE = "/v1/system/menuColumn/update",
  GET_BY_ID = "/v1/system/menuColumn/getById/",
  LIST_PAGE = "/v1/system/menuColumn/listPage",
  LIST_BY_MENU_IDS = "/v1/system/menuColumn/listByMenuIds",
  LIST_ALL = "/v1/system/menuColumn/listAll",
  EXPORT = "/v1/system/menuColumn/export",
}

export class MenuColumnService {
  // 新增
  static async create(data: any) {
    return await request.post<BaseResponse>({
      url: API.CREATE,
      data,
    });
  }

  // 导入
  static async import(data: any) {
    return await request.post<BaseResponse>({
      url: API.IMPORT,
      data,
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  }

  // 删除
  static async delete(id: string) {
    return await request.del<BaseResponse>({
      url: API.DELETE + id,
    });
  }

  // 批量删除
  static async batchDelete(data: string[]) {
    return await request.post<BaseResponse>({
      url: API.BATCH_DELETE,
      data,
    });
  }

  // 更新
  static async update(data: any) {
    return await request.put<BaseResponse>({
      url: API.UPDATE,
      data,
    });
  }

  // 根据ID进行查询
  static async getById(id: string) {
    return await request.get<BaseResponse>({
      url: API.GET_BY_ID + id,
    });
  }

  // 分页查询
  static async listPage(params: any) {
    return await request.get<BaseResponse>({
      url: API.LIST_PAGE,
      params
    });
  }

  // 根据菜单ID查询列
  static async listByMenuIds(data: any) {
    return await request.post<BaseResponse>({
      url: API.LIST_BY_MENU_IDS,
      data
    });
  }

  // 列表查询
  static async listAll() {
    return await request.get<BaseResponse>({
      url: API.LIST_ALL,
    });
  }

  // 导出
  static async export(params: any) {
    return await request.get({
      url: API.EXPORT,
      params,
      responseType: "blob",
    });
  }
}
