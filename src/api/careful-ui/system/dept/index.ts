// 导入二次封装axios
import sky from "@/utils/axios";

// 统一管理接口
enum API {
  CREATE = "/v1/system/dept/create",
  EXPORT = "/v1/system/dept/export",
  DELETE = "/v1/system/dept/delete/",
  BATCH_DELETE = "/v1/system/dept/batch/delete",
  UPDATE = "/v1/system/dept/update",
  LIST_TREE = "/v1/system/dept/listTree",
  LIST_ALL = "/v1/system/dept/listAll",
  GET_BY_ID = "/v1/system/dept/getById/",
}

// 添加
export const create = (data: any) => sky.post(API.CREATE, data);

// 导出
export const exportExcel = () => sky.export(API.EXPORT);

// 删除
export const deleteById = (id: any) => sky.delete(API.DELETE + id);

// 批量删除
export const batchDelete = (ids: any) => sky.post(API.BATCH_DELETE, ids);

// 更新
export const update = (data: any) => sky.put(API.UPDATE, data);

// 分页查询
export const listTree = (params: any) => sky.get(API.LIST_TREE, params);

// 列表查询
export const listAll = () => sky.get(API.LIST_ALL);

// 根据ID进行查询
export const getById = (id: any) => sky.get(API.GET_BY_ID + id);
