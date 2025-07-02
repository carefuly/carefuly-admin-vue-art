<script setup>
import {skyMsgWarning, skyMsgBox} from "@/utils/toast";

// 子组件接收父组件的值
// withDefaults：设置默认值  defineProps：接收父组件的参数
// const props = withDefaults(defineProps<IDrawerProps>(), {
//   title: "朕很中意你SkyDrawer",
//   visible: false,
//   size: "450",
//   closeOnClickModel: false,
//   destroyOnClose: false,
//   confirmText: "确定",
//   cancelText: "取消",
//   direction: "rtl",
//   loading: false,
//   footerHidden: false
// });
const props = defineProps({
  title: {default: "朕很中意你SkyDrawer"},
  visible: {default: false},
  size: {default: "450"},
  closeOnClickModel: {default: true},
  destroyOnClose: {default: false},
  confirmText: {default: "确定"},
  cancelText: {default: "取消"},
  direction: {default: "rtl"},
  loading: {default: false},
  footerHidden: {default: false},
});
// 开关变量
const visible = ref(false);
// 确定的loading，此处必须用toRefs，否则将失去响应式
const {loading} = toRefs(props);
const confirmLoading = ref(loading);

// 打开抽屉
const skyOpen = () => {
  visible.value = true;
};

// 关闭抽屉
const skyClose = () => {
  skyMsgBox("您确认进行关闭么？")
    .then(() => {
      visible.value = false;
      skyMsgWarning("已关闭🌻");
    })
    .catch(() => {
      // 用户点击了取消按钮或关闭确认框
      // 执行取消操作或不做任何操作
      skyMsgWarning("已取消🌻");
    });
};

// 确认提交后关闭弹窗
const skyQuickClose = () => {
  visible.value = false;
  skyMsgWarning("已提交🌻");
};

// 确认
const skyConfirm = () => {
  emits("skyConfirm");
};

// 关闭抽屉
const skyCancel = () => {
  emits("skyCancel");
};

// 当前组件获取父组件传递的事件方法，然后点击确认和提交是触发父组件传递过来的事件
const emits = defineEmits(["skyConfirm", "skyCancel"]);

// defineExpose是vue3新增的一个api，放在<script setup>下使用的，
// 目的是把属性和方法暴露出去，可以用于父子组件通信，子组件把属性暴露出去，
// 父组件用ref获取子组件DOM，子组件暴露的方法或属性可以用dom获取。
defineExpose({
  skyOpen,
  skyClose,
  skyQuickClose
});
</script>

<template>
  <div>
    <el-drawer
      v-model="visible"
      :title="props.title"
      :size="props.size"
      :direction="props.direction"
      :close-on-click-modal="props.closeOnClickModel"
      :destroy-on-close="props.destroyOnClose"
      :before-close="skyClose"
      :loading="props.loading"
      :footerHidden="props.footerHidden"
    >
      <div class="formDrawer">
        <div class="body">
          <slot name="content"></slot>
        </div>
        <div class="footer" v-if="!props.footerHidden">
          <el-button type="primary" loading-icon="Eleme" :loading="confirmLoading" @click="skyConfirm">
            {{ props.confirmText }}
          </el-button>
          <el-button type="danger" @click="skyCancel">{{ props.cancelText }}</el-button>
        </div>
        <div class="footer" v-else>
          <!-- 具名插槽 -->
          <slot name="footer"></slot>
        </div>
      </div>
    </el-drawer>
  </div>
</template>

<style scoped lang="scss">
.formDrawer {
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;

  .body {
    bottom: 50px;
    flex: 1;
    overflow-y: auto; // 超出部分则滚动
  }

  .footer {
    display: flex;
    align-items: center;
    height: 50px;
    margin-top: auto;
    // justify-content: center;
  }
}

:deep(.el-drawer__title) {
  font-weight: 600;
  @apply dark:c-#CFD3DC;
}

:deep(.el-drawer__body) {
  padding-top: 0px;
}

:deep(.el-drawer__header) {
  margin-bottom: 18px;
}
</style>
