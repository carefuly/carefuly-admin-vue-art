import type {Router, RouteLocationNormalized, NavigationGuardNext} from 'vue-router';
import {ref, nextTick} from 'vue'
import NProgress from "@/utils/http/nprogress";
import {useSettingStore} from '@/store/modules/setting';
import {useUserStore} from '@/store/modules/user';
import {useMenuStore} from '@/store/modules/menu';
import {setWorktab} from '@/utils/navigation';
import {setPageTitle, setSystemTheme} from '../utils/utils';
import {registerDynamicRoutes} from '../utils/registerRoutes';
import {AppRouteRecord} from '@/types/router';
import {RoutesAlias} from '../routesAlias';
import {menuDataToRouter} from '../utils/menuToRouter';
import {loadingService} from '@/utils/ui';
import {useCommon} from '@/composables/useCommon';
import {useWorktabStore} from '@/store/modules/worktab';
import {MenuService} from "@/api/careful-ui/system/menu";
import {asyncRoutes} from "@/router/routes/asyncRoutes";
import {router} from "@/router";

// 前端权限模式 loading 关闭延时，提升用户体验
const LOADING_DELAY = 300

// 是否已注册动态路由
const isRouteRegistered = ref(false)

// 跟踪是否需要关闭 loading
const pendingLoading = ref(false)

/**
 * 路由全局前置守卫
 * 处理进度条、获取菜单列表、动态路由注册、404 检查、工作标签页及页面标题设置
 */
export function setupBeforeEachGuard(router: Router): void {
  router.beforeEach(
    async (
      to: RouteLocationNormalized,
      from: RouteLocationNormalized,
      next: NavigationGuardNext
    ) => {
      try {
        await handleRouteGuard(to, from, next, router)
      } catch (error) {
        console.error('路由守卫处理失败:', error)
        next('/exception/500')
      }
    }
  )

  // 设置后置守卫以关闭 loading 和进度条
  setupAfterEachGuard(router)
}

/**
 * 设置路由全局后置守卫
 */
function setupAfterEachGuard(router: Router): void {
  router.afterEach(() => {
    // 关闭进度条
    const settingStore = useSettingStore()
    if (settingStore.showNprogress) {
      NProgress.done()
    }

    // 关闭 loading 效果
    if (pendingLoading.value) {
      nextTick(() => {
        loadingService.hideLoading()
        pendingLoading.value = false
      })
    }
  })
}

/**
 * 处理路由守卫逻辑
 */
async function handleRouteGuard(
  to: RouteLocationNormalized,
  from: RouteLocationNormalized,
  next: NavigationGuardNext,
  router: Router
): Promise<void> {
  const settingStore = useSettingStore();
  const userStore = useUserStore();

  // 处理进度条
  if (settingStore.showNprogress) {
    NProgress.start();
  }

  // 设置系统主题
  setSystemTheme(to);

  // 处理登录状态
  if (!(await handleLoginStatus(to, userStore, next))) {
    return;
  }

  // 处理动态路由注册
  if (!isRouteRegistered.value && userStore.isLogin) {
    await handleDynamicRoutes(to, router, next)
    return
  }

  // 处理根路径跳转到首页
  if (userStore.isLogin && isRouteRegistered.value && handleRootPathRedirect(to, next)) {
    return
  }

  // 处理已知的匹配路由
  if (to.matched.length > 0) {
    setWorktab(to);
    setPageTitle(to);
    next();
    return
  }

  // 尝试刷新路由重新注册
  if (userStore.isLogin && !isRouteRegistered.value) {
    await handleDynamicRoutes(to, router, next)
    return
  }

  // 如果以上都不匹配，跳转到404
  next(RoutesAlias.Exception404);
}

/**
 * 处理登录状态
 */
async function handleLoginStatus(
  to: RouteLocationNormalized,
  userStore: ReturnType<typeof useUserStore>,
  next: NavigationGuardNext
): Promise<boolean> {
  if (!userStore.isLogin && to.path !== RoutesAlias.Login && !to.meta.noLogin) {
    userStore.logOut()
    next(RoutesAlias.Login)
    return false
  }
  return true
}

/**
 * 处理动态路由注册
 */
async function handleDynamicRoutes(
  to: RouteLocationNormalized,
  router: Router,
  next: NavigationGuardNext
): Promise<void> {
  try {
    // 显示 loading 并标记 pending
    pendingLoading.value = true
    loadingService.showLoading()

    await getMenuData(router);

    // 处理根路径跳转
    if (handleRootPathRedirect(to, next)) {
      return
    }

    next({
      path: to.path,
      query: to.query,
      hash: to.hash,
      replace: true
    });
  } catch (error) {
    console.error('动态路由注册失败:', error)
    next('/exception/500')
  }
}

/**
 * 获取菜单数据
 * @param router 路由实例
 */
async function getMenuData(router: Router): Promise<void> {
  try {
    if (useCommon().isFrontendMode.value) {
      await processFrontendMenu(router) // 前端控制模式
    } else {
      await processBackendMenu(router) // 后端控制模式
    }
  } catch (error) {
    handleMenuError(error);
  }
}

/**
 * 处理前端控制模式的菜单逻辑
 */
async function processFrontendMenu(router: Router): Promise<void> {
  const closeLoading = loadingService.showLoading()
  const menuList = asyncRoutes.map((route) => menuDataToRouter(route))
  const userStore = useUserStore()
  const roles: string[] = [];

  // if (!roles) {
  //   closeLoading()
  //   throw new Error('获取用户角色失败')
  // }

  const filteredMenuList = filterMenuByRoles(menuList, roles)
  await new Promise((resolve) => setTimeout(resolve, 300))
  await registerAndStoreMenu(router, filteredMenuList, closeLoading)
}

/**
 * 处理后端控制模式的菜单逻辑
 */
async function processBackendMenu(router: Router): Promise<void> {
  const closeLoading = loadingService.showLoading();
  const {menuList} = await getMenuList();
  await registerAndStoreMenu(router, menuList, closeLoading);
}

/**
 * 处理菜单
 */
async function getMenuList() {
  try {
    let menuData = [];
    if (useUserStore().isLogin) {
      const res = await MenuService.listTree({status: true});
      menuData = res.data;
    } else {
      menuData = [];
    }
    // 处理菜单数据
    const menuList = menuData.map((route: any) => menuDataToRouter(route));
    return {menuList};
  } catch (error) {
    throw error instanceof Error ? error : new Error(`获取菜单失败, 请刷新重试🌻【${error}】`);
  }
}

/**
 * 注册路由并存储菜单数据
 */
async function registerAndStoreMenu(router: Router, menuList: AppRouteRecord[], closeLoading: () => void): Promise<void> {
  if (!isValidMenuList(menuList)) {
    closeLoading()
    throw new Error('获取菜单列表失败，请重新登录🌻');
  }

  const menuStore = useMenuStore();
  menuStore.setMenuList(filterHiddenMenus(menuList));
  registerDynamicRoutes(router, menuList);
  isRouteRegistered.value = true;
  useWorktabStore().validateWorktabs(router);
  closeLoading();
}

/**
 * 处理菜单相关错误
 */
function handleMenuError(error: unknown): void {
  router.push(RoutesAlias.Login);
  console.error('菜单处理失败:', error);
  useUserStore().logOut();
  throw error instanceof Error ? error : new Error('获取菜单列表失败，请重新登录');
}

/**
 * 根据角色过滤菜单
 */
const filterMenuByRoles = (menu: AppRouteRecord[], roles: string[]): AppRouteRecord[] => {
  return menu.reduce((acc: AppRouteRecord[], item) => {
    const itemRoles = item.meta?.roles
    const hasPermission = !itemRoles || itemRoles.some((role) => roles?.includes(role))

    if (hasPermission) {
      const filteredItem = {...item}
      if (filteredItem.children?.length) {
        filteredItem.children = filterMenuByRoles(filteredItem.children, roles)
      }
      acc.push(filteredItem)
    }

    return acc
  }, [])
}

/**
 * 过滤隐藏的菜单项（递归函数）
 * @param menus 原始菜单数组
 * @returns 过滤后的菜单数组
 */
function filterHiddenMenus(menus: AppRouteRecord[]): AppRouteRecord[] {
  return menus
    .filter(menu => !menu.meta.isHide) // 首先过滤掉当前层级隐藏的项
    .map(menu => {
      // 如果有子菜单，递归处理子菜单
      if (menu.children && menu.children.length) {
        const filteredChildren = filterHiddenMenus(menu.children);

        // 如果子菜单都被过滤掉，并且不保留空节点，则移除children属性
        // 注意：这里创建新的菜单项对象，避免修改原始数据
        return {
          ...menu,
          children: filteredChildren.length > 0 ? filteredChildren : []
        };
      }
      // 没有子菜单直接返回
      return menu;
    });
}

/**
 * 验证菜单列表是否有效
 */
function isValidMenuList(menuList: AppRouteRecord[]): boolean {
  return Array.isArray(menuList) && menuList.length > 0;
}

/**
 * 重置路由相关状态
 */
export function resetRouterState(): void {
  isRouteRegistered.value = false
  const menuStore = useMenuStore()
  menuStore.removeAllDynamicRoutes()
  menuStore.setMenuList([])
}

/**
 * 处理根路径跳转到首页
 */
function handleRootPathRedirect(to: RouteLocationNormalized, next: NavigationGuardNext): boolean {
  if (to.path === '/') {
    const {homePath} = useCommon()
    if (homePath.value) {
      next({path: homePath.value, replace: true})
      return true
    }
  }
  return false
}

