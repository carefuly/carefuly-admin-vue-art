<script setup lang="ts">
import {ref, reactive, watch, computed, nextTick} from 'vue';
import type {ElTree, ElDropdown} from 'element-plus';
import {
  Operation,
  RefreshRight,
  SetUp,
  Fold,
  Expand,
  Check,
  Close
} from '@element-plus/icons-vue';

type TreeNode = Record<string, any>;
type TreeProps = {
  label?: string;
  children?: string;
  disabled?: string | boolean;
  isLeaf?: string;
  class?: string;
};

/**
 * 增强型树组件事件定义
 */
const emit = defineEmits<{
  /** 刷新事件 */
  (e: 'refresh'): void;
  /** 搜索事件（回车或清空时触发） */
  (e: 'search', text: string): void;
  /** 节点点击事件 */
  (e: 'node-click', data: TreeNode, node: any, component: any): void;
  /** 节点勾选状态变化事件 */
  (e: 'check-change', data: TreeNode, checked: boolean): void;
  /** 节点勾选事件（包含所有选中节点） */
  (e: 'check', data: TreeNode[], node: any): void;
  /** 展开/折叠所有节点事件 */
  (e: 'toggle-collapse-all', collapsed: boolean): void;
  /** 更新展开节点事件 */
  (e: 'update:expandedKeys', keys: (string | number)[]): void;
}>();

/**
 * 树组件属性定义
 */
interface TreeComponentProps {
  /** 标题文本 */
  title?: string;
  /** 是否加载完成 */
  loading?: boolean;
  /** 树数据 */
  data?: TreeNode[];
  /** 树配置项 */
  nodeProps?: TreeProps;
  /** 节点唯一标识字段 */
  nodeKey?: string;
  /** 是否显示搜索框 */
  showSearch?: boolean;
  /** 搜索框占位符 */
  searchPlaceholder?: string;
  /** 默认选中的节点key数组 */
  defaultCheckedKeys?: Array<string | number>;
  /** 默认展开的节点key数组 */
  defaultExpandedKeys?: Array<string | number>;
  /** 是否可拖拽 */
  draggable?: boolean;
  /** 自定义节点类名函数 */
  nodeClassName?: (data: TreeNode, node: any) => string;
  /** 是否显示图标 */
  showIcon?: boolean;
  /** 自定义图标组件 */
  icon?: any;
  /** 节点高度(px) */
  nodeHeight?: number;
  /** 展开图标尺寸(px) */
  expandIconSize?: number;
  /** 是否显示操作菜单 */
  showMenu?: boolean;
  /** 是否层级独立(父子不关联) */
  checkStrictly?: boolean;
}

// 默认属性值设置
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
  defaultCheckedKeys: () => [],
  defaultExpandedKeys: () => [],
  draggable: false,
  showIcon: true,
  icon: Operation,
  nodeHeight: 36,
  expandIconSize: 16,
  showMenu: true,
  checkStrictly: false,
});

const treeRef = ref<InstanceType<typeof ElTree>>();
const dropdownRef = ref<InstanceType<typeof ElDropdown>>();

// 使用响应式变量存储当前展开的节点keys
const expandedKeys = ref<Array<string | number>>([...props.defaultExpandedKeys]);

// 收集所有可展开节点（非叶子节点）的key
const allExpandableKeys = computed(() => {
  const keys: Array<string | number> = [];
  const childrenKey = props.nodeProps?.children || 'children';

  const traverse = (nodes: TreeNode[]) => {
    if (!nodes) return;

    nodes.forEach(node => {
      const key = node[props.nodeKey];
      if (key !== undefined) {
        // 如果有子节点，则记录为可展开节点
        if (node[childrenKey]?.length) {
          keys.push(key);
        }
        // 递归子节点
        if (node[childrenKey] && node[childrenKey].length) {
          traverse(node[childrenKey]);
        }
      }
    });
  };

  if (props.data) {
    traverse(props.data);
  }
  return keys;
});

// 所有节点的key（用于全选）
const allNodeKeys = computed(() => {
  const keys: Array<string | number> = [];

  const traverse = (nodes: TreeNode[]) => {
    nodes.forEach(node => {
      const key = node[props.nodeKey];
      if (key !== undefined) {
        keys.push(key);
        const children = node[props.nodeProps?.children || 'children'];
        if (children?.length) {
          traverse(children);
        }
      }
    });
  };

  if (props.data) {
    traverse(props.data);
  }
  return keys;
});

const pageData = reactive({
  filterText: '',
  checkStrictly: props.checkStrictly,
  forceUpdateKey: 0, // 用于强制更新树的key
});

/**
 * 组件方法集
 */
const method = reactive({
  /** 执行节点查询过滤 */
  queryNode: () => {
    treeRef.value?.filter(pageData.filterText);
    emit('search', pageData.filterText);
  },

  /** 触发刷新事件 */
  handleRefresh: () => {
    emit('refresh');
  },

  /** 节点过滤方法 */
  filterNode: (value: string, data: TreeNode, node: any) => {
    if (!value) return true;
    return data[props.nodeProps?.label || 'label']?.includes(value);
  },

  /** 节点点击事件处理 */
  handleNodeClick: (data: TreeNode, node: any, component: any) => {
    emit('node-click', data, node, component);
  },

  /** 节点勾选状态变更处理 */
  handleCheckChange: (data: TreeNode, checked: boolean) => {
    emit('check-change', data, checked);
  },

  /** 节点勾选事件处理 */
  handleCheck: (data: TreeNode, node: any) => {
    const checkedNodes = treeRef.value?.getCheckedNodes() || [];
    emit('check', checkedNodes, node);
  },

  /** 菜单命令处理 */
  handleMenuCommand: (command: string) => {
    switch (command) {
      case 'select-all':
        method.selectAll();
        break;
      case 'deselect-all':
        method.deselectAll();
        break;
      case 'expand-all':
        method.expandAll();
        break;
      case 'collapse-all':
        method.collapseAll();
        break;
      case 'hierarchy-link':
        method.toggleStrictlyMode(false);
        break;
      case 'hierarchy-indep':
        method.toggleStrictlyMode(true);
        break;
    }
    dropdownRef.value?.handleClose();
  },

  /** 全选节点 */
  selectAll: () => {
    treeRef.value?.setCheckedKeys(allNodeKeys.value);
  },

  /** 取消全选节点 */
  deselectAll: () => {
    treeRef.value?.setCheckedKeys([]);
  },

  /** 展开所有节点 */
  expandAll: () => {
    // 设置展开的节点为所有非叶子节点
    expandedKeys.value = [...allExpandableKeys.value];
    emit('toggle-collapse-all', false);
    emit('update:expandedKeys', [...expandedKeys.value]);
  },

  /** 折叠所有节点 */
  collapseAll: () => {
    expandedKeys.value = [];
    emit('toggle-collapse-all', true);
    emit('update:expandedKeys', []);
  },

  /** 切换层级选择模式 */
  toggleStrictlyMode: (strict: boolean) => {
    pageData.checkStrictly = strict;
    // 强制重新渲染树组件
    pageData.forceUpdateKey += 1;
  },

  /** 获取选中节点 */
  getCheckedNodes: (): TreeNode[] => {
    return treeRef.value?.getCheckedNodes() || [];
  },

  /** 设置选中节点 */
  setCheckedKeys: (keys: Array<string | number>) => {
    treeRef.value?.setCheckedKeys(keys);
  }
});

// 监听默认展开节点变化（初始化和外部更新）
watch(() => props.defaultExpandedKeys, (newVal) => {
  if (newVal) {
    expandedKeys.value = [...newVal];
  }
}, {immediate: true});

// 监听数据变化，如果展开的节点key在新数据中不存在，则从expandedKeys中移除
watch(() => props.data, (newData) => {
  if (!newData) return;

  // 检查当前展开的keys是否都在新数据中，如果不在则移除
  const currentKeysSet = new Set(expandedKeys.value);
  const newDataKeys = new Set<string | number>();

  const traverse = (nodes: TreeNode[]) => {
    nodes.forEach(node => {
      const key = node[props.nodeKey];
      if (key !== undefined) {
        newDataKeys.add(key);
        const children = node[props.nodeProps?.children || 'children'];
        if (children?.length) {
          traverse(children);
        }
      }
    });
  };

  traverse(newData || []);

  // 过滤掉新数据中不存在的key
  const newExpandedKeys = expandedKeys.value.filter(key => newDataKeys.has(key));
  if (newExpandedKeys.length !== expandedKeys.value.length) {
    expandedKeys.value = newExpandedKeys;
  }
}, {deep: true});

// 监听默认选中节点变化
watch(() => props.defaultCheckedKeys, (newVal) => {
  if (newVal && newVal.length > 0) {
    nextTick(() => {
      method.setCheckedKeys(newVal);
    });
  }
}, {immediate: true});

// 暴露组件方法
defineExpose({
  getCheckedNodes: method.getCheckedNodes,
  setCheckedKeys: method.setCheckedKeys,
  selectAll: method.selectAll,
  deselectAll: method.deselectAll,
  expandAll: method.expandAll,
  collapseAll: method.collapseAll,
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
        <!-- 操作菜单下拉框 -->
        <el-dropdown
          v-if="showMenu"
          ref="dropdownRef"
          trigger="click"
          placement="bottom-end"
          @command="method.handleMenuCommand"
        >
          <el-button text>
            <el-icon :size="20">
              <SetUp/>
            </el-icon>
          </el-button>

          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item command="select-all">
                <el-icon class="menu-icon">
                  <Check/>
                </el-icon>
                选择全部
              </el-dropdown-item>
              <el-dropdown-item command="deselect-all">
                <el-icon class="menu-icon">
                  <Close/>
                </el-icon>
                取消选择
              </el-dropdown-item>
              <el-dropdown-item divided/>
              <el-dropdown-item command="expand-all">
                <el-icon class="menu-icon">
                  <Expand/>
                </el-icon>
                展开全部
              </el-dropdown-item>
              <el-dropdown-item command="collapse-all">
                <el-icon class="menu-icon">
                  <Fold/>
                </el-icon>
                折叠全部
              </el-dropdown-item>
              <el-dropdown-item divided/>
              <el-dropdown-item command="hierarchy-link">
                <el-icon v-if="!pageData.checkStrictly" class="menu-icon">
                  <Check/>
                </el-icon>
                <span v-else class="icon-placeholder"></span>
                层级关联
              </el-dropdown-item>
              <el-dropdown-item command="hierarchy-indep">
                <el-icon v-if="pageData.checkStrictly" class="menu-icon">
                  <Check/>
                </el-icon>
                <span v-else class="icon-placeholder"></span>
                层级独立
              </el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>

        <!-- 刷新按钮 -->
        <el-icon class="refresh-icon" @click="method.handleRefresh">
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

    <!-- 树形组件容器（添加key强制更新） -->
    <div class="tree-container">
      <el-tree
        :key="pageData.forceUpdateKey"
        ref="treeRef"
        class="enhanced-tree"
        :show-checkbox="true"
        :check-strictly="pageData.checkStrictly"
        v-loading="loading"
        :data="data"
        :props="nodeProps"
        :node-key="nodeKey"
        :default-expanded-keys="expandedKeys"
        :filter-node-method="method.filterNode"
        :draggable="draggable"
        :node-class-name="nodeClassName"
        @node-click="method.handleNodeClick"
        @check-change="method.handleCheckChange"
        @check="method.handleCheck"
        @node-expand="(data, node, component) => expandedKeys.push(data[nodeKey])"
        @node-collapse="(data, node, component) => expandedKeys = expandedKeys.filter(k => k !== data[nodeKey])"
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
  padding: 12px;
  box-sizing: border-box;

  .tree-header {
    display: flex;
    justify-content: space-between;
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

    .right-section {
      display: flex;
      align-items: center;
      gap: 8px;

      .el-button {
        padding: 4px;
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

.menu-icon {
  margin-right: 5px;
}

/* 添加图标占位样式 */
.icon-placeholder {
  display: inline-block;
  width: 1em;
  height: 1em;
  margin-right: 5px;
}
</style>
