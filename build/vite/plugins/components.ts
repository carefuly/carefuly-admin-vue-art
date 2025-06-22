import components from 'unplugin-vue-components/vite';
import {ElementPlusResolver} from 'unplugin-vue-components/resolvers';

export default function createComponents() {
  return components({
    deep: true,
    extensions: ['vue', 'tsx'],
    // 指定组件位置，默认是 src/components 自动导入自定义组件
    dirs: ['src/components'],
    resolvers: [ElementPlusResolver()],
    include: [/\.vue$/, /\.vue\?vue/, /\.tsx$/],
    // 配置文件生成位置
    dts: './src/types/components.d.ts' // 指定类型声明文件的路径
  })
}
