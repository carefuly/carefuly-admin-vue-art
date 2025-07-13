import App from './App.vue';
import {createApp} from 'vue';
// 引入路由
import {initRouter} from './router'
// 引入仓库pinia
import {initStore} from './store';
// 引入ElementPlus所有图标
import * as ElementPlusIconsVue from '@element-plus/icons-vue';
// 引入I18n语言配置
import language from './locales'
// 引入全局自定义指令
import {setupGlobDirectives} from './directives';

// SVG插件配置
import "virtual:svg-icons-register";
// 解决chrome下的warning问题
// import "default-passive-events";

// 引入ElementPlus
import ElementPlus from "element-plus";
// 引入ElementPlus的css
import "element-plus/dist/index.css";
// @ts-ignore忽略当前文件ts类型的检测否则有红色提示(打包会失败)
import zhCn from "element-plus/dist/locale/zh-cn.mjs";
// 引入ElementPlus的暗黑模式css
import "element-plus/theme-chalk/dark/css-vars.css";

// 引入css
import '@/assets/styles/reset.scss'                         // 重置HTML样式
import '@/assets/styles/app.scss'                           // 全局样式
import '@/assets/styles/el-ui.scss'                         // 优化element样式
import '@/assets/styles/mobile.scss'                        // 移动端样式优化
import '@/assets/styles/change.scss'                        // 主题切换过渡优化
import '@/assets/styles/theme-animation.scss'               // 主题切换动画
import '@/assets/styles/el-light.scss'                      // Element 自定义主题（亮色）
import '@/assets/styles/el-dark.scss'                       // Element 自定义主题（暗色）
import '@/assets/styles/dark.scss'                          // 系统主题
import '@/assets/icons/system/iconfont.js'                  // 系统彩色图标
import '@/assets/icons/system/iconfont.css'                 // 系统图标

// 引入js
import '@/utils/sys/console.ts'                             // 控制台输出内容

document.addEventListener(
  'touchstart',
  function () {
  },
  {passive: false}
);

const app = createApp(App);

// 注册ElementPlus所有图标
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component)
}

// 注册路由
initRouter(app);
// 注册pinia
initStore(app);
// 注册全局自定义指令
setupGlobDirectives(app);

// 注册全局自定义指令
app.use(language);

// 挂载
app.mount('#app')
