<script setup lang="ts">
import AppConfig from '@/config';
import {useI18n} from 'vue-i18n';
import {useTheme} from '@/composables/useTheme';
import {LanguageEnum, SystemThemeEnum} from '@/enums/appEnum';
import {$t, languageOptions} from '@/locales';
import {HOME_PAGE} from '@/router/routesAlias';
import {RoutesAlias} from '@/router/routesAlias';
import {useUserStore} from '@/store/modules/user';
import {useSettingStore} from '@/store/modules/setting'
import {skyMsgError, skyNoticeSuccess} from "@/utils/toast";
import {getCssVar} from '@/utils/ui';
import {AuthService} from "@/api/careful-ui/auth";
import type {FormInstance, FormRules} from 'element-plus';

defineOptions({name: 'Login'});

const {t} = useI18n();
const {locale} = useI18n();
const router = useRouter();
const settingStore = useSettingStore();
const userStore = useUserStore();
const {isDark, systemThemeType} = storeToRefs(settingStore);
const {width} = useWindowSize();

const dragVerify = ref();
const formRef = ref<FormInstance>();
const pageData = reactive({
  accounts: [
    {
      userName: 'careful',
      password: '123456',
    },
    {
      userName: 'admin',
      password: '123456',
    },
  ],
  isPassing: false,
  isClickPass: false,
  systemName: AppConfig.systemInfo.name,
  loading: false,
  formData: {
    username: 'careful',
    password: '123456',
    rememberPassword: true,
  },
  rules: {
    username: [{required: true, message: t('login.placeholder[0]'), trigger: 'blur'}],
    password: [{required: true, message: t('login.placeholder[1]'), trigger: 'blur'}]
  }
});
const method = reactive({
  /** 切换主题 */
  handleToggleTheme: function () {
    let {LIGHT, DARK} = SystemThemeEnum;
    useTheme().switchThemeStyles(systemThemeType.value === LIGHT ? DARK : LIGHT);
  },
  /** 切换语言 */
  handleChangeLanguage: function (lang: LanguageEnum) {
    if (locale.value === lang) return;
    locale.value = lang;
    userStore.setLanguage(lang);
  },
  /** 提交 */
  handleSubmit: function () {
    if (!formRef.value) return;
    formRef.value.validate(async (valid: any) => {
      if (valid) {
        if (!pageData.isPassing) {
          pageData.isClickPass = true;
          return;
        }
        pageData.loading = true;
        const data = {
          userName: pageData.formData.username,
          password: pageData.formData.password
        }
        try {
          const res = await AuthService.login(data);
          const {token} = res.data;
          if (token) {
            // 设置token
            userStore.setToken(token, token);
            // 登录成功提示
            method.handleShowLoginSuccessNotice();
            // 获取用户信息
            const res = await AuthService.userinfo();
            // 设置登录状态
            userStore.setLoginStatus(true);
            userStore.setUserInfo(res.data);
            userStore.setLoginStatus(true);
            router.push(HOME_PAGE);
          }
        } catch (error) {
          skyMsgError(`登录失败，请刷新重试🌻【${error}】`);
        } finally {
          pageData.loading = false;
          method.handleResetDragVerify();
        }
      } else {
        skyMsgError(`校验失败，信息填写有误🌻`);
      }
    });
  },
  /** 重置拖拽验证 */
  handleResetDragVerify: function () {
    dragVerify.value.reset();
  },
  /** 登录成功提示 */
  handleShowLoginSuccessNotice: function () {
    skyNoticeSuccess(
      `${t('login.success.message')}, ${pageData.systemName}!`,
      t('login.success.message')
    );
  },
});
</script>

<template>
  <div class="login">
    <LoginLeftView/>

    <div class="right-wrap">
      <div class="top-right-wrap">
        <div class="btn theme-btn" @click="method.handleToggleTheme">
          <i class="iconfont-sys">
            {{ isDark ? '&#xe6b5;' : '&#xe725;' }}
          </i>
        </div>
        <el-dropdown @command="method.handleChangeLanguage" popper-class="langDropDownStyle">
          <div class="btn language-btn">
            <i class="iconfont-sys icon-language">&#xe611;</i>
          </div>
          <template #dropdown>
            <el-dropdownMenu>
              <div v-for="lang in languageOptions" :key="lang.value" class="lang-btn-item">
                <el-dropdownItem
                  :command="lang.value"
                  :class="{ 'is-selected': locale === lang.value }"
                >
                  <span class="menu-txt">{{ lang.label }}</span>
                  <i v-if="locale === lang.value" class="iconfont-sys icon-check">&#xe621;</i>
                </el-dropdownItem>
              </div>
            </el-dropdownMenu>
          </template>
        </el-dropdown>
      </div>
      <div class="header">
        <ArtLogo class="icon"/>
        <h1>{{ pageData.systemName }}</h1>
      </div>
      <div class="login-wrap">
        <div class="form">
          <h3 class="title">{{ $t('login.title') }}</h3>
          <p class="sub-title">{{ $t('login.subTitle') }}</p>
          <el-form
            ref="formRef"
            :model="pageData.formData"
            :rules="pageData.rules"
            @keyup.enter="method.handleSubmit"
            style="margin-top: 25px"
          >
            <el-formItem prop="username">
              <el-input :placeholder="$t('login.placeholder[0]')" v-model.trim="pageData.formData.username"/>
            </el-formItem>
            <el-formItem prop="password">
              <el-input
                :placeholder="$t('login.placeholder[1]')"
                v-model.trim="pageData.formData.password"
                type="password"
                radius="8px"
                autocomplete="off"
              />
            </el-formItem>
            <div class="drag-verify">
              <div class="drag-verify-content" :class="{ error: !pageData.isPassing && pageData.isClickPass }">
                <ArtDragVerify
                  ref="dragVerify"
                  v-model:value="pageData.isPassing"
                  :width="width < 500 ? 328 : 438"
                  :text="$t('login.sliderText')"
                  textColor="var(--art-gray-800)"
                  :successText="$t('login.sliderSuccessText')"
                  :progressBarBg="getCssVar('--el-color-primary')"
                  background="var(--art-gray-200)"
                  handlerBg="var(--art-main-bg-color)"
                />
              </div>
              <p class="error-text" :class="{ 'show-error-text': !pageData.isPassing && pageData.isClickPass }">
                {{ $t('login.placeholder[2]') }}
              </p>
            </div>
            <div class="forget-password">
              <el-checkbox v-model="pageData.formData.rememberPassword">
                {{ $t('login.rememberPwd') }}
              </el-checkbox>
              <RouterLink :to="RoutesAlias.ForgetPassword">{{ $t('login.forgetPwd') }}</RouterLink>
            </div>
            <div style="margin-top: 30px">
              <el-button
                class="login-btn"
                type="primary"
                @click="method.handleSubmit"
                :loading="pageData.loading"
                v-ripple
              >
                {{ $t('login.btnText') }}
              </el-button>
            </div>
            <div class="footer">
              <p>
                {{ $t('login.noAccount') }}
                <RouterLink :to="RoutesAlias.Register">{{ $t('login.register') }}</RouterLink>
              </p>
            </div>
          </el-form>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
@use './index';
</style>
