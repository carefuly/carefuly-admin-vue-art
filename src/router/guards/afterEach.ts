import {Router} from 'vue-router';
import {useSettingStore} from '@/store/modules/setting';
import NProgress from "@/utils/http/nprogress";

/** 路由全局后置守卫 */
export function setupAfterEachGuard(router: Router) {
  router.afterEach(() => {
    if (useSettingStore().showNprogress) NProgress.done();
  })
}
