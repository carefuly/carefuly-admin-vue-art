import autoImport from 'unplugin-auto-import/vite';
import {ElementPlusResolver} from 'unplugin-vue-components/resolvers';

export default function createAutoImport() {
  return autoImport({
    // 自动导入 vue 相关函数，如: ref、reactive、toRef等
    imports: [
      'vue',
      'vue-router',
      'pinia',
      '@vueuse/core'
    ],
    resolvers: [ElementPlusResolver()],
    dts: './src/types/auto-imports.d.ts',
    eslintrc: {
      // 这里先设置成true然后pnpm dev 运行之后会生成 .auto-import.json 文件之后，在改为false
      enabled: true,
      filepath: './.auto-import.json',
      globalsPropValue: true
    }
  })
}
