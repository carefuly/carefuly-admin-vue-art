<script setup lang="ts">
import AppConfig from '@/config';
import {useI18n} from 'vue-i18n';
import {$t} from "@/locales";
import {RoutesAlias} from '@/router/routesAlias';
import {AuthService} from "@/api/careful-ui/auth";
import {skyMsgError, skyMsgSuccess, skyNoticeSuccess} from "@/utils/toast";
import type {FormInstance} from 'element-plus';

defineOptions({name: 'Register'});

const {t} = useI18n();

const router = useRouter();
const formRef = ref<FormInstance>();

/** 验证密码 */
const handleValidatePass = function (rule: any, value: string, callback: any) {
  if (value === '') {
    callback(new Error(t('register.placeholder[1]')));
  } else {
    if (pageData.formData.confirmPassword !== '') {
      formRef.value?.validateField('confirmPassword');
    }
    callback();
  }
};
/** 验证密码 */
const handleValidatePass2 = function (rule: any, value: string, callback: any) {
  if (value === '') {
    callback(new Error(t('register.rule[0]')));
  } else if (value !== pageData.formData.password) {
    callback(new Error(t('register.rule[1]')));
  } else {
    callback();
  }
};

const pageData = reactive({
  loading: false,
  systemName: AppConfig.systemInfo.name,
  formData: {
    username: '',
    password: '',
    confirmPassword: '',
    agreement: false
  },
  rules: {
    username: [
      {required: true, message: t('register.placeholder[0]'), trigger: 'blur'},
      {min: 3, max: 20, message: t('register.rule[2]'), trigger: 'blur'}
    ],
    password: [
      {required: true, validator: handleValidatePass, trigger: 'blur'},
      {min: 6, message: t('register.rule[3]'), trigger: 'blur'}
    ],
    confirmPassword: [{required: true, validator: handleValidatePass2, trigger: 'blur'}],
    agreement: [
      {
        validator: (rule: any, value: boolean, callback: any) => {
          if (!value) {
            callback(new Error(t('register.rule[4]')))
          } else {
            callback()
          }
        },
        trigger: 'change'
      }
    ]
  },
});
const method = reactive({
  /** 注册 */
  handleRegister: function () {
    if (!formRef.value) return;
    formRef.value.validate(async (valid: any) => {
      if (valid) {
        pageData.loading = true;
        try {
          const res: any = await AuthService.register({
            username: pageData.formData.username,
            password: pageData.formData.password,
          });
          skyMsgSuccess(res.msg + "🌻");
          skyNoticeSuccess(res.msg + "🌻");
          method.toLogin();
        } catch (error) {
          // 等待1秒关闭loading
          let loadingTime = 1;
          setInterval(() => {
            loadingTime--;
            if (loadingTime === 0) {
              pageData.loading = false;
            }
          }, 1000);
          skyMsgError(`注册失败，请刷新重试【${error}】`);
        }
      } else {
        skyMsgError(`校验失败，信息填写有误`);
      }
    });
  },
  /** 跳转登录 */
  toLogin: function () {
    setTimeout(() => {
      router.push(RoutesAlias.Login);
    }, 1000);
  },
});

</script>

<template>
  <div class="login register">
    <LoginLeftView></LoginLeftView>

    <div class="right-wrap">
      <div class="header">
        <ArtLogo class="icon"/>
        <h1>{{ pageData.systemName }}</h1>
      </div>
      <div class="login-wrap">
        <div class="form">
          <h3 class="title">{{ $t('register.title') }}</h3>
          <p class="sub-title">{{ $t('register.subTitle') }}</p>
          <el-form ref="formRef" :model="pageData.formData" :rules="pageData.rules" label-position="top">
            <el-formItem prop="username">
              <el-input
                v-model.trim="pageData.formData.username"
                :placeholder="$t('register.placeholder[0]')"
              />
            </el-formItem>

            <el-formItem prop="password">
              <el-input
                v-model.trim="pageData.formData.password"
                :placeholder="$t('register.placeholder[1]')"
                type="password"
                autocomplete="off"
              />
            </el-formItem>

            <el-formItem prop="confirmPassword">
              <el-input
                v-model.trim="pageData.formData.confirmPassword"
                :placeholder="$t('register.placeholder[2]')"
                type="password"
                autocomplete="off"
                @keyup.enter="method.handleRegister"
              />
            </el-formItem>

            <el-formItem prop="agreement">
              <el-checkbox v-model="pageData.formData.agreement">
                {{ $t('register.agreeText') }}
                <router-link
                  style="color: var(--main-color); text-decoration: none"
                  to="/privacy-policy"
                >
                  {{ $t('register.privacyPolicy') }}
                </router-link>
              </el-checkbox>
            </el-formItem>

            <div style="margin-top: 15px">
              <el-button
                class="register-btn"
                type="primary"
                @click="method.handleRegister"
                :loading="pageData.loading"
                v-ripple
              >
                {{ $t('register.submitBtnText') }}
              </el-button>
            </div>

            <div class="footer">
              <p>
                {{ $t('register.hasAccount') }}
                <router-link :to="RoutesAlias.Login">{{ $t('register.toLogin') }}</router-link>
              </p>
            </div>
          </el-form>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
@use '../login/index' as login;
@use './index' as register;
</style>
