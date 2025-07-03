// 导入二次封装axios
import request from "@/utils/http";
import {BaseResponse} from '@/types/api';

// 统一管理接口
enum API {
  CREATE = "/v1/tools/dictType/create",
  IMPORT = "/v1/tools/dictType/import",
  EXPORT = "/v1/tools/dictType/export",
  DELETE = "/v1/tools/dictType/delete/",
  BATCH_DELETE = "/v1/tools/dictType/delete/batchDelete",
  UPDATE = "/v1/tools/dictType/update",
  GET_BY_ID = "/v1/tools/dictType/getById/",
  LIST_BY_DICT_NAMES = "/v1/tools/dictType/listByDictNames",
  LIST_PAGE = "/v1/tools/dictType/listPage",
  LIST_ALL = "/v1/tools/dictType/listAll",
}

export class DictTypeService {
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

  // 根据字典名称批量查询字典项
  static async listByDictNames(data: string[]) {
    return await request.post<BaseResponse>({
      url: API.LIST_BY_DICT_NAMES,
      data
    });
  }

  // 分页查询
  static async listPage(params: any) {
    return await request.get<BaseResponse>({
      url: API.LIST_PAGE,
      params
    });
  }

  // 列表查询
  static async listAll(params: any) {
    return await request.get<BaseResponse>({
      url: API.LIST_ALL,
      params
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
