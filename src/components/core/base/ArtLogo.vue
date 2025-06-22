<script setup lang="ts">
const props = defineProps({
  width: {
    type: Number,
    default: 36
  }
})

const logoStyle = computed(() => ({width: `${props.width}px`}))
</script>

<template>
  <div class="art-logo">
    <img :style="logoStyle" src="@/assets/img/common/logo.webp" alt="logo"/>
  </div>
</template>

<style scoped lang="scss">
.art-logo {
  display: flex;
  align-items: center;
  justify-content: center;

  img {
    width: 100%;
    height: 100%;
  }
}
</style>
