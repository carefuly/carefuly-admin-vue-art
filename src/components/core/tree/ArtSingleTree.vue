<script setup lang="ts">
import {ref, reactive, watch} from 'vue';
import {Operation, RefreshRight} from '@element-plus/icons-vue';
import type {ElTree} from 'element-plus';

// 继承原始组件的所有类型定义
type TreeNode = Record<string, any>;
type TreeProps = {
  label?: string;
  children?: string;
  disabled?: string;
  isLeaf?: string;
  class?: string;
};

const emit = defineEmits<{
  (e: 'refresh'): void;
  (e: 'search', text: string): void;
  (e: 'node-click', data: TreeNode, node: any, component: any): void;
  (e: 'current-change', data: TreeNode, node: any): void;
}>();

interface TreeComponentProps {
  title?: string;
  loading?: boolean;
  data?: TreeNode[];
  nodeProps?: TreeProps;
  nodeKey?: string;
  showSearch?: boolean;
  searchPlaceholder?: string;
  defaultSelectedKey?: string | number;
  highlightCurrent?: boolean;
  draggable?: boolean;
  nodeClassName?: (data: TreeNode, node: any) => string;
  showIcon?: boolean;
  icon?: any;
  // 新增的样式相关props
  nodeHeight?: number;
  expandIconSize?: number;
}

const props = withDefaults(defineProps<TreeComponentProps>(), {
  title: '',
  loading: false,
  data: () => [],
  nodeProps: () => ({
    label: 'label',
    children: 'children',
    disabled: 'disabled',
    isLeaf: 'isLeaf',
  }),
  nodeKey: 'id',
  showSearch: true,
  searchPlaceholder: '请输入关键词搜索',
  highlightCurrent: true,
  draggable: false,
  showIcon: true,
  icon: Operation,
  // 默认样式值
  nodeHeight: 36,
  expandIconSize: 16,
});

const treeRef = ref<InstanceType<typeof ElTree>>();
const pageData = reactive({
  filterText: '',
  currentSelectedKey: props.defaultSelectedKey,
});

const method = reactive({
  queryNode: () => {
    treeRef.value?.filter(pageData.filterText);
    emit('search', pageData.filterText);
  },
  handleRefresh: () => {
    emit('refresh');
  },
  filterNode: (value: string, data: TreeNode, node: any) => {
    if (!value) return true;
    return data[props.nodeProps?.label || 'label']?.includes(value);
  },
  handleNodeClick: (data: TreeNode, node: any, component: any) => {
    pageData.currentSelectedKey = data[props.nodeKey];
    emit('node-click', data, node, component);
    emit('current-change', data, node);
  },
  setCurrentNode: (key: string | number) => {
    treeRef.value?.setCurrentKey(key);
    pageData.currentSelectedKey = key;
  },
  getCurrentNode: (): TreeNode | undefined => {
    return treeRef.value?.getCurrentNode();
  },
  getTreeInstance: () => {
    return treeRef.value;
  },
  clearSelection: () => {
    treeRef.value?.setCurrentKey(null);
  },
});

watch(() => props.defaultSelectedKey, (newVal) => {
  if (newVal) {
    method.setCurrentNode(newVal);
  }
});

if (props.defaultSelectedKey) {
  method.setCurrentNode(props.defaultSelectedKey);
}

defineExpose({
  setCurrentNode: method.setCurrentNode,
  getCurrentNode: method.getCurrentNode,
  getTreeInstance: method.getTreeInstance,
  clearSelection: method.clearSelection,
});
</script>

<template>
  <div class="enhanced-element-tree">
    <!-- 标题区域 -->
    <div v-if="title" class="tree-header">
      <div class="left-section">
        <el-icon v-if="showIcon" class="tree-icon">
          <component :is="icon"/>
        </el-icon>
        <h3 class="tree-title">{{ title }}</h3>
      </div>
      <div class="right-section">
        <el-icon
          class="refresh-icon"
          @click="method.handleRefresh"
        >
          <RefreshRight/>
        </el-icon>
      </div>
    </div>

    <!-- 搜索框 -->
    <div class="tree-controls">
      <el-input
        v-if="showSearch"
        v-model="pageData.filterText"
        class="tree-search"
        :placeholder="searchPlaceholder"
        clearable
        @keydown.enter="method.queryNode"
        @clear="method.queryNode"
      />
      <slot name="other-input"></slot>
    </div>

    <!-- 树形组件容器 -->
    <div class="tree-container">
      <el-tree
        ref="treeRef"
        class="enhanced-tree"
        v-loading="loading"
        :data="data"
        :props="nodeProps"
        :node-key="nodeKey"
        :filter-node-method="method.filterNode"
        :highlight-current="highlightCurrent"
        :draggable="draggable"
        :node-class-name="nodeClassName"
        @node-click="method.handleNodeClick"
      >
        <template #default="{ node, data }">
          <div class="custom-tree-node">
            <slot name="node-content" :node="node" :data="data">
              <span class="node-label">{{ node.label }}</span>
            </slot>
          </div>
        </template>
      </el-tree>
    </div>
  </div>
</template>

<style scoped lang="scss">
.enhanced-element-tree {
  height: 100%;
  display: flex;
  flex-direction: column;
  //background: #fff;
  //border-radius: 8px;
  //box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05);
  padding: 12px;
  box-sizing: border-box;

  .tree-header {
    display: flex;
    justify-content: space-between; // 确保标题和图标分居两侧
    align-items: center;
    padding: 8px 0 16px;
    color: var(--el-color-primary);
    border-bottom: 1px solid var(--el-border-color-light);
    margin-bottom: 12px;

    .left-section {
      display: flex;
      align-items: center;
    }

    .tree-icon {
      margin-right: 8px;
      font-size: 18px;
    }

    .tree-title {
      margin: 0;
      font-size: 16px;
      font-weight: 600;
    }

    .refresh-icon {
      font-size: 18px;
      cursor: pointer;
      transition: transform 0.3s ease;
      padding: 4px;
      border-radius: 4px;

      &:hover {
        color: var(--el-color-primary);
        background: var(--el-color-primary-light-9);
        transform: rotate(360deg);
      }
    }
  }

  .tree-controls {
    margin-bottom: 12px;

    .tree-search {
      :deep(.el-input__wrapper) {
        border-radius: 6px;
      }
    }
  }

  .tree-container {
    flex: 1;
    overflow: auto;
    position: relative;
    border-radius: 6px;
    background: #fff;

    /* 自定义树样式 */
    :deep(.enhanced-tree) {
      --node-height: v-bind('props.nodeHeight + "px"');
      --expand-icon-size: v-bind('props.expandIconSize + "px"');

      width: 100%;
      min-width: fit-content;
      background: transparent;
      color: #333;

      /* 节点样式 */
      .el-tree-node {
        position: relative;
        padding: 2px 0;

        &:focus > .el-tree-node__content {
          background-color: transparent;
        }
      }

      /* 节点内容区域 */
      .el-tree-node__content {
        height: var(--node-height);
        transition: all 0.2s ease;
        border-radius: 4px;
        margin: 2px 0;
        padding-right: 16px;

        &:hover {
          background-color: var(--el-color-primary-light-9);
        }

        .el-tree-node__expand-icon {
          width: var(--expand-icon-size);
          height: var(--expand-icon-size);
          font-size: var(--expand-icon-size);
          color: var(--el-text-color-secondary);
          transition: all 0.2s;
          margin-right: 6px;

          &.expanded {
            transform: rotate(90deg);
          }

          &.is-leaf {
            color: transparent;
          }
        }

        .el-tree-node__label {
          font-size: 14px;
        }
      }

      /* 当前选中节点 */
      .el-tree-node.is-current > .el-tree-node__content {
        background-color: var(--el-color-primary-light-8);
        color: var(--el-color-primary);
        font-weight: 500;

        .el-tree-node__expand-icon {
          color: var(--el-color-primary);
        }
      }

      /* 自定义节点内容 */
      .custom-tree-node {
        display: flex;
        align-items: center;
        width: 100%;
        height: 100%;

        .node-label {
          flex: 1;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
      }
    }
  }
}
</style>
