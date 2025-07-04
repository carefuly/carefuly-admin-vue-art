<script setup lang="ts">
import {MenuService} from "@/api/careful-ui/system/menu";
import {RoleService} from "@/api/careful-ui/system/role";
import {skyMsgError} from "@/utils/toast";

const pageData = reactive({
  active: 0,

  menuLoading: false,
  menuList: [],
});
const method = reactive({
  /** 上一步 */
  /** 下一步 */
  handleNext() {
    if (pageData.active++ > 3) {
      pageData.active = 0;
    }
  },

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
  handleMenuCheck(checkedNodes: any[]) {
    console.log('选中的节点:', checkedNodes);
  },

  /** 获取菜单结构 */
  /** 获取菜单结构 */
  /** 获取菜单结构 */
});

// 暴露方法给父组件
defineExpose({
  handleMenuList: method.handleMenuList,
});
</script>

<template>
  <ArtTableFullScreen>
    <el-steps :active="pageData.active" finish-status="success" simple>
      <el-step title="菜单权限"/>
      <el-step title="按钮权限"/>
      <el-step title="列表权限"/>
      <el-step title="数据权限"/>
    </el-steps>

    <!-- 菜单权限 -->
    <ArtMultiTree
      v-if="pageData.active === 0"
      title="菜单权限"
      :loading="pageData.menuLoading"
      :data="pageData.menuList"
      :nodeProps="{label: 'title', children: 'children'}"
      node-key="id"
      @check="method.handleMenuCheck"
    />

  </ArtTableFullScreen>
</template>

<style scoped lang="scss">

</style>
