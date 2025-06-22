// 导入二次封装axios
import request from "@/utils/http";
import {BaseResponse} from '@/types/api';

// 统一管理接口
enum API {
  LIST_TREE = "/v1/system/menu/listTree",
}

export class MenuService {
  // 获取用户菜单所有列表
  static async listTree() {
    return await request.get<BaseResponse>({
      url: API.LIST_TREE,
    });
  }
}
