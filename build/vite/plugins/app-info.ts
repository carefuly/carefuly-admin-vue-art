import type {Plugin} from 'vite';
import boxen from 'boxen';
import picocolors from 'picocolors';

export default function appInfo(): Plugin {
  return {
    name: "appInfo",
    apply: 'serve',
    async buildStart() {
      const {bold, green, cyan, bgGreen} = picocolors;
      // eslint-disable-next-line no-console
      console.log(
        boxen(
          `${bold(green(`${bgGreen('CarefulAdmin v1.0.0-SNAPSHOT')}`))}\n${cyan('持续迭代优化的CAREFUL ADMIN管理系统。')}`,
          {
            padding: 1,
            margin: 1,
            borderStyle: 'double',
            title: 'Welcome use',
            titleAlignment: 'center',
            textAlignment: 'center',
          }
        )
      )
    }
  }
}
