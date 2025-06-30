<script setup lang="ts">
import zh from 'element-plus/es/locale/lang/zh-cn';
import en from 'element-plus/es/locale/lang/en';
import {useUserStore} from './store/modules/user';
import {systemUpgrade} from './utils/sys';
import {setThemeTransitionClass} from './utils/theme/animation';
import {checkStorageCompatibility} from './utils/storage';
import {AuthService} from "@/api/careful-ui/auth";
import {skyMsgWarning} from "@/utils/toast";

const userStore = useUserStore();
const {language} = storeToRefs(userStore);

const locales = {
  zh: zh,
  en: en
}

// 获取用户信息
const getUserInfo = async () => {
  if (userStore.isLogin) {
    try {
      const res = await AuthService.userinfo();
      userStore.setUserInfo(res.data);
    } catch (error) {
      skyMsgWarning(`获取用户信息失败，请刷新重试🌻【${error}】`);
    }
  }
}

onBeforeMount(() => {
  setThemeTransitionClass(true);
});

onMounted(() => {
  // 检查存储兼容性
  checkStorageCompatibility();
  // 提升暗黑主题下页面刷新视觉体验
  setThemeTransitionClass(false);
  // 系统升级
  systemUpgrade();
  // 获取用户信息
  // getUserInfo();
});
</script>

<template>
  <ElConfigProvider size="default" :locale="locales[language]" :z-index="3000">
    <RouterView></RouterView>
  </ElConfigProvider>
</template>

<style scoped lang="scss">

</style>
