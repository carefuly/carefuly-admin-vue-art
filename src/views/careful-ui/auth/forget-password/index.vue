<script setup lang="ts">
import AppConfig from '@/config';
import {$t} from "@/locales";
import {RoutesAlias} from '@/router/routesAlias';

defineOptions({name: 'ForgetPassword'});

const router = useRouter();
const showInputLabel = ref(false);

const systemName = AppConfig.systemInfo.name;
const username = ref('');
const loading = ref(false);

const register = async () => {
};

const toLogin = () => {
  router.push(RoutesAlias.Login);
};
</script>

<template>
  <div class="login register">
    <LoginLeftView></LoginLeftView>
    <div class="right-wrap">
      <div class="header">
        <ArtLogo class="icon"/>
        <h1>{{ systemName }}</h1>
      </div>
      <div class="login-wrap">
        <div class="form">
          <h3 class="title">{{ $t('forgetPassword.title') }}</h3>
          <p class="sub-title">{{ $t('forgetPassword.subTitle') }}</p>
          <div class="input-wrap">
            <span class="input-label" v-if="showInputLabel">账号</span>
            <el-input :placeholder="$t('forgetPassword.placeholder')" v-model.trim="username"/>
          </div>

          <div style="margin-top: 15px">
            <el-button
              class="login-btn"
              type="primary"
              @click="register"
              :loading="loading"
              v-ripple
            >
              {{ $t('forgetPassword.submitBtnText') }}
            </el-button>
          </div>

          <div style="margin-top: 15px">
            <el-button class="back-btn" plain @click="toLogin">
              {{ $t('forgetPassword.backBtnText') }}
            </el-button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
@use '../login/index';
</style>
