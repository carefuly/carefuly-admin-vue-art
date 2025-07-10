// 导入二次封装axios
import request from "@/utils/http";
import {BaseResponse} from '@/types/api';

// 统一管理接口
enum API {
  CREATE = "/v1/system/dept/create",
  DELETE = "/v1/system/dept/delete/",
  BATCH_DELETE = "/v1/system/dept/delete/batchDelete",
  UPDATE = "/v1/system/dept/update",
  GET_BY_ID = "/v1/system/dept/getById/",
  LIST_TREE = "/v1/system/dept/listTree",
  EXPORT = "/v1/system/dept/export",
}

export class DeptService {
  // 新增
  static async create(data: any) {
    return await request.post<BaseResponse>({
      url: API.CREATE,
      data,
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

  // 获取树形结构
  static async listTree(params: any) {
    return await request.get<BaseResponse>({
      url: API.LIST_TREE,
      params,
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
