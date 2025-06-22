// 导入二次封装axios
import sky from "@/utils/axios";

// 统一管理接口
enum API {
  CAPTCHA = "/v1/third/generateCaptcha",
}

// 生成指定业务验证码
export const captcha = (data: any) => sky.get(API.CAPTCHA, data);
