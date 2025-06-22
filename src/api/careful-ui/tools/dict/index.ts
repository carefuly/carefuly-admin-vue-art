// 导入二次封装axios
import sky from "@/utils/axios";

// 统一管理接口
enum API {
  CREATE = "/v1/tools/dict/create",
  EXPORT = "/v1/tools/dict/export",
  DELETE = "/v1/tools/dict/delete/",
  BATCH_DELETE = "/v1/tools/dict/batchDelete",
  UPDATE = "/v1/tools/dict/update",
  GET_BY_ID = "/v1/tools/dict/getById/",
  LIST_PAGE = "/v1/tools/dict/listPage",
  LIST_ALL = "/v1/tools/dict/listAll",
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

// 根据ID进行查询
export const getById = (id: any) => sky.get(API.GET_BY_ID + id);

// 分页查询
export const listPage = (params: any) => sky.get(API.LIST_PAGE, params);

// 列表查询
export const listAll = () => sky.get(API.LIST_ALL);
