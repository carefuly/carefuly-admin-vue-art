<script setup lang="ts">
import {MenuService} from "@/api/careful-ui/system/menu";
import {MenuButtonService} from "@/api/careful-ui/system/menu/menu_button";
import {MenuColumnService} from "@/api/careful-ui/system/menu/menu_column";
import {RoleService} from "@/api/careful-ui/system/role";
import {skyMsgError} from "@/utils/toast";

const emit = defineEmits<{
  (e: "handleCheckMenu", active: number, data: any): void

  (e: 'update:form', form: any): void
}>();
const props = withDefaults(
  defineProps<{
    active: number
    form: Object
  }>(),
  {},
);


const pageData = reactive({
  active: 0,

  menuLoading: false,
  menuList: [],
  menuButtonLoading: false,
  menuButtonList: [],
});
const method = reactive({
  /** 获取菜单结构 */
  async handleMenuList() {
    pageData.menuLoading = true;
    pageData.menuList = [];
    try {
      const res = await MenuService.listTree({status: true});
      pageData.menuList = res.data;
    } catch (error) {
      skyMsgError(`数据查询失败，请刷新重试🌻【${error}】`);
    } finally {
      pageData.menuLoading = false;
    }
  },
  /** 选择菜单 */
  handleCheckMenu(checkedNodes: any[]) {
    const ids = checkedNodes.map((check: any) => check.id);
    emit('handleCheckMenu', pageData.active, checkedNodes)
  },

  /** 获取菜单按钮结构 */
  async handleMenuButtonList() {
    pageData.menuButtonLoading = true;
    pageData.menuButtonList = [];
    try {
      const res = await MenuButtonService.listByMenuIds([]);
      console.log(res);
      pageData.menuButtonList = res.data;
    } catch (error) {
      skyMsgError(`数据查询失败，请刷新重试🌻【${error}】`);
    } finally {
      pageData.menuButtonLoading = false;
    }
  },

  /** 获取菜单结构 */
  /** 获取菜单结构 */
});

// 暴露方法给父组件
defineExpose({
  handleMenuList: method.handleMenuList,
  handleMenuButtonList: method.handleMenuButtonList,
});
</script>

<template>
  <ArtTableFullScreen>
    {{ props.form }}
    <el-steps :active="props.active" finish-status="success" simple>
      <el-step title="菜单权限"/>
      <el-step title="按钮权限"/>
      <el-step title="列表权限"/>
      <el-step title="数据权限"/>
    </el-steps>

    <!-- 菜单权限 -->
    <ArtMultiTree
      v-if="props.active === 0"
      title="菜单权限"
      :loading="pageData.menuLoading"
      :data="pageData.menuList"
      :nodeProps="{label: 'title', children: 'children'}"
      node-key="id"
      @check="method.handleCheckMenu"
    />
    <!-- 按钮权限 -->
    <ArtMultiTree
      v-if="props.active === 1"
      title="按钮权限"
      :loading="pageData.menuButtonList"
      :data="pageData.menuButtonList"
      :nodeProps="{label: 'title', children: 'children'}"
      node-key="id"
      @check="method.handleCheckMenu"
    />
    <!-- 列表权限 -->
    <!-- 数据权限 -->
  </ArtTableFullScreen>
</template>

<style scoped lang="scss">

</style>
