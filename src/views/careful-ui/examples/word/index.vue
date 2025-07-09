<script setup lang="ts">
import Frontend from "./components/frontend.vue";
</script>

<template>
  <ArtTableFullScreen>
    <div class="page">
      <el-card class="" shadow="never">
        <el-tabs class="demo-tabs">
          <el-tab-pane label="前端导出" name="前端导出">
            <Frontend/>
          </el-tab-pane>
          <el-tab-pane label="后端导出" name="后端导出">后端导出</el-tab-pane>
        </el-tabs>
      </el-card>
    </div>
  </ArtTableFullScreen>
</template>

<style scoped lang="scss">

</style>
