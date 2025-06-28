<script setup lang="ts">


const pageData = reactive({});
const method = reactive({});
</script>

<template>
  <ArtTableFullScreen style="display: flex;">
    <div style="width: 25%" class="dict-page mr2" id="table-full-screen">
      <el-card shadow="never" class="art-table-card">

      </el-card>
    </div>
    <div style="width: 75%" class="dict-page" id="table-full-screen">
      <el-card shadow="never" class="art-table-card">

      </el-card>
    </div>
  </ArtTableFullScreen>
</template>

<style scoped lang="scss">

</style>
