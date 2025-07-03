<script setup lang="ts">
import ArtButtonTable from "@/components/core/forms/ArtButtonTable.vue";
import MenuButton from "./components/button.vue";
import MenuColumn from "./components/column.vue";
import {useCheckedColumns} from "@/composables/useCheckedColumns";
import {IconTypeEnum} from "@/enums/appEnum";
import {useDictAll} from "@/hooks/dict";
import {SearchChangeParams, SearchFormItem} from '@/types';
import {skyMsgBox, skyMsgSuccess, skyMsgError, skyMsgInfo, skyMsgWarning, skyNoticeError, skyNoticeSuccess} from "@/utils/toast";
import {DictTypeService} from "@/api/careful-ui/tools/dict_type";
import {MenuService} from "@/api/careful-ui/system/menu";

const iconType = ref(IconTypeEnum.UNICODE);
// const {artDict} = useDictAll(["菜单类型", "状态"]);
const dictNames = ["菜单类型", "接口请求方法", "状态"];
let artDict: any = reactive({
  "菜单类型": [],
  "接口请求方法": [],
  "状态": [],
});

// 定义表单搜索初始值
const initialSearchState = {
  title: "",
  status: true,
};
const tabs = ref("表单");
const skyDrawerRef = ref();
const tableRef = ref();
const formRef = ref();
const skyExcelRef = ref();
const menuButtonRef = ref();
const menuColumnRef = ref();
const pageData = reactive({
  menu_id: "",
  pagination: {
    page: 1,
    pageSize: 15,
    Creator: null,
    Modifier: null,
  },
  formFilters: {...initialSearchState},
  tabsMenu: "菜单按钮",
  confirmLoading: false,
  dialogVisible: false,
  isExpanded: false,
  dialogType: "add",
  form: {
    id: null,
    parent_id: null,
    type: 2,
    title: "",
    icon: "",
    name: "",
    component: "",
    path: "",
    redirect: "",
    isHide: false,
    isLink: null,
    isKeepAlive: false,
    isFull: false,
    isAffix: false,
    sort: 1,
    status: true,
    remark: "",
  },
  rules: {
    title: [
      {required: true, message: '请输入菜单标题', trigger: 'blur'},
      {min: 1, max: 100, message: '长度在 1 到 64 个字符', trigger: 'blur'}
    ],
    name: [
      {required: true, message: '请输入组件名称', trigger: 'blur'},
      {min: 1, max: 100, message: '长度在 1 到 64 个字符', trigger: 'blur'}
    ],
    path: [
      {required: true, message: '请输入路由地址', trigger: 'blur'},
      {min: 1, max: 100, message: '长度在 1 到 128 个字符', trigger: 'blur'}
    ],
  },
  ids: [],
  loading: false,
  columnOptions: [
    // {label: '勾选', type: 'selection'},
    // {label: '字典名称', prop: 'name'},
    // {label: '字典编码', prop: 'code'},
    // {label: '字典分类', prop: 'type'},
    // {label: '数据类型', prop: 'valueType'},
    // {label: '状态', prop: 'status'},
    // {label: '创建时间', prop: 'create_time'},
    // {label: '备注', prop: 'remark'},
    // {label: '操作', prop: 'operation'}
  ],
  total: 0,
  tableList: [],
});
const method = reactive({
  /** 获取指定字典项 */
  async handleListByNames() {
    artDict = {};
    try {
      const res = await DictTypeService.listByDictNames(dictNames);
      artDict = res.data;
    } catch (error) {
      skyMsgError(`数据查询失败，请刷新重试🌻【${error}】`);
    }
  },
  /** 表单项变更处理 */
  handleFormChange(params: SearchChangeParams) {
    console.log("表单项变更:", params);
  },
  /** 重置搜索表单 */
  handleSearchReset() {
    Object.assign(pageData.formFilters, {...initialSearchState});
    pageData.pagination.page = 1; // 重置到第一页
    pageData.pagination.pageSize = 15;
    method.handleListPage();
  },
  /** 搜索 */
  handleSearch() {
    console.log('搜索参数:', pageData.formFilters);
    pageData.pagination.page = 1; // 搜索时重置到第一页
    method.handleListPage();
  },
  /** 刷新表格数据 */
  handleRefresh() {
    method.handleListPage();
  },
  /** 显示对话 */
  showDialog(type: string, row?: any) {
    tabs.value = "表单";
    pageData.dialogType = type;
    pageData.dialogVisible = true;

    // 重置表单验证状态
    if (formRef.value) {
      formRef.value.resetFields();
    }

    if (type === "edit" && row) {
      const id = row ? row.id : pageData.ids[0];
      if (id == null || id === "") {
        skyMsgError("请选中需要修改的数据🌻");
      }
      // 回显数据
      method.handleEcho(id);
    } else {
      pageData.form.id = null;
      pageData.form.parent_id = null;
      pageData.form.type = 2;
      pageData.form.title = "";
      pageData.form.icon = "";
      pageData.form.name = "";
      pageData.form.component = "";
      pageData.form.path = "";
      pageData.form.redirect = "";
      pageData.form.isHide = false;
      pageData.form.isLink = null;
      pageData.form.isKeepAlive = false;
      pageData.form.isFull = false;
      pageData.form.isAffix = false;
      pageData.form.sort = 1;
      pageData.form.status = true;
      pageData.form.remark = "";
    }
  },
  /** 获取图标 */
  handleGetIcon(icon: string) {
    pageData.form.icon = icon;
  },
  /** 收起OR展开 */
  handleToggleExpand() {
    pageData.isExpanded = !pageData.isExpanded;
    nextTick(() => {
      if (tableRef.value) {
        tableRef.value[pageData.isExpanded ? 'expandAll' : 'collapseAll']();
      }
    })
  },
  /** 删除 */
  handleDelete(row: any) {
    const id = row.id;
    if (id === null || id === "") {
      skyMsgWarning("请选中需要删除的数据🌻");
      return;
    }
    skyMsgBox("您确认需要删除名称[" + row.name + "]么？")
      .then(async () => {
        try {
          await MenuService.delete(id);
          skyNoticeSuccess("删除成功🌻");
        } catch (error) {
          skyNoticeError(`删除失败，请刷新重试🌻【${error}】`);
        } finally {
          await method.handleListPage();
        }
      })
      .catch(() => {
        skyMsgError("已取消🌻");
      });
  },
  /** 批量删除 */
  handleBatchDelete() {
    if (pageData.ids.length == 0) {
      skyMsgInfo("请选择需要删除的数据🌻");
      return;
    }
    skyMsgBox("您确认需要进行批量删除么？")
      .then(async () => {
        try {
          await MenuService.batchDelete(pageData.ids);
          skyNoticeSuccess(`批量删除成功🌻`);
        } catch (error) {
          skyNoticeSuccess(`批量删除失败，请刷新重试🌻【${error}】`);
        } finally {
          await method.handleListPage();
        }
      })
      .catch(() => {
        skyMsgError("已取消🌻");
      });
  },
  /** 打开菜单按钮和列 */
  async handleOpenMenuColumn(row: any) {
    pageData.menu_id = row.id;
    pageData.tabsMenu = "菜单按钮";
    skyDrawerRef.value.skyOpen();

    await nextTick();

    if (menuColumnRef.value) {
      menuColumnRef.value.handleListPage();
    }
    if (menuButtonRef.value) {
      menuButtonRef.value.handleListPage();
    }
  },
  /** 回显数据 */
  async handleEcho(id: any) {
    if (id === null || id === "") {
      skyMsgWarning("请选择需要修改的数据🌻");
      return;
    }
    try {
      const res = await MenuService.getById(id);
      pageData.form = res.data;
    } catch (error) {
      skyNoticeError(`数据获取失败，请刷新重试🌻【${error}】`);
    }
  },
  /** 提交 */
  async handleSubmit() {
    if (!formRef.value) return;

    await formRef.value.validate(async (valid: any) => {
      if (valid) {
        if (pageData.form.id) {
          try {
            await MenuService.update(pageData.form);
            skyNoticeSuccess("修改成功🌻");
          } catch (error) {
            skyNoticeError(`修改失败，请刷新重试🌻【${error}】`);
          }
        } else {
          try {
            await MenuService.create(pageData.form);
            skyNoticeSuccess("添加成功🌻");
          } catch (error) {
            skyNoticeError(`添加失败，请刷新重试🌻【${error}】`);
          }
        }

        pageData.dialogVisible = false;
        await method.handleListPage();
      } else {
        skyMsgError("验证失败，请检查填写内容🌻");
      }
    })
  },
  /** 是否多选 */
  handleSelectionChange(selection: any) {
    pageData.ids = selection.map((item: any) => item.id);
  },
  /** 获取信息 */
  async handleListPage() {
    pageData.loading = true;
    pageData.tableList = [];
    try {
      const res = await MenuService.listTree({
        ...pageData.formFilters
      });
      pageData.tableList = res.data;
    } catch (error) {
      skyMsgError(`数据查询失败，请刷新重试🌻【${error}】`);
    } finally {
      pageData.loading = false;
    }
  },
});
// 表单配置项
const formItems: SearchFormItem[] = [
  {
    label: '菜单标题',
    prop: 'title',
    type: 'input',
    config: {
      clearable: true
    },
    onChange: method.handleFormChange,
  },
  {
    label: '状态',
    prop: 'status',
    type: 'radio',
    options: [
      {label: '启用', value: true},
      {label: '停用', value: false}
    ],
    onChange: method.handleFormChange
  },
];
// 动态列配置
const {columnChecks, columns} = useCheckedColumns(() => [
  {type: 'selection'}, // 勾选列
  {label: '菜单标题', prop: 'title'},
  {label: '菜单类型', prop: 'type'},
  {label: '组件名称', prop: 'name'},
  {label: '组件地址', prop: 'component'},
  {label: '路由地址', prop: 'path'},
  {label: '重定向地址', prop: 'redirect'},
  {label: '排序', prop: 'sort'},
  {label: '状态', prop: 'status'},
  {label: '创建时间', prop: 'createTime'},
  {label: '备注', prop: 'remark'},
  {
    prop: 'operation',
    label: '操作',
    width: 180,
    fixed: 'right', // 固定在右侧
    formatter: (row: any) => {
      return h('div', [
        h(ArtButtonTable, {
          type: 'edit',
          onClick: async () => method.showDialog('edit', row)
        }),
        h(ArtButtonTable, {
          type: 'delete',
          onClick: () => method.handleDelete(row)
        }),
        h(ArtButtonTable, {
          type: 'more',
          onClick: () => method.handleOpenMenuColumn(row)
        }),
      ])
    }
  }
]);

onMounted(() => {
  method.handleListByNames();
  method.handleListPage();
});
</script>

<template>
  <ArtTableFullScreen>
    <div class="page" id="table-full-screen">
      <!-- 搜索栏 -->
      <ArtSearchBar
        v-model:filter="pageData.formFilters"
        :items="formItems"
        :showExpand="false"
        @reset="method.handleSearchReset"
        @search="method.handleSearch"
      />

      <el-card shadow="never" class="art-table-card">
        <!-- 表格头部 -->
        <ArtTableHeader
          :columnList="pageData.columnOptions"
          v-model:columns="columnChecks"
          @refresh="method.handleRefresh"
        >
          <template #left>
            <el-button type="primary" plain @click="method.showDialog('add')" v-ripple>新增</el-button>
            <el-button type="danger" plain @click="method.handleBatchDelete" v-ripple>删除</el-button>
            <el-button type="info" plain @click="method.handleToggleExpand" v-ripple>
              {{ pageData.isExpanded ? '收起' : '展开' }}
            </el-button>
            <!--            <el-button type="success" plain @click="method.handleImportExcel">导入</el-button>-->
            <!--            <el-button type="warning" plain @click="method.handleDownload">导出</el-button>-->
          </template>
        </ArtTableHeader>

        <!-- 表格 -->
        <ArtTable
          ref="tableRef"
          row-key="id"
          :loading="pageData.loading"
          :data="pageData.tableList"
          :marginTop="10"
          :stripe="false"
          @selection-change="method.handleSelectionChange"
        >
          <template #default>
            <el-table-column v-for="col in columns" :key="col.prop || col.type" v-bind="col" show-overflow-tooltip/>
          </template>
        </ArtTable>

        <!-- 表单 -->
        <el-dialog
          v-model="pageData.dialogVisible"
          :title="pageData.dialogType === 'add' ? '添加' : '编辑'"
          width="700px"
          align-center
        >
          <el-tabs type="border-card" v-model="tabs">
            <el-tab-pane label="表单" name="表单">
              <el-form ref="formRef" :model="pageData.form" :rules="pageData.rules" label-width="85px">
                <el-form-item label="上级菜单" prop="parent_id">
                  <el-cascader
                    style="width: 100%"
                    placeholder="请选择上级菜单"
                    v-model="pageData.form.parent_id"
                    :options="pageData.tableList"
                    :props="{
                      expandTrigger: 'hover',
                      emitPath: false,
                      checkStrictly: true,
                      value: 'id',
                      label: 'title',
                    }"
                    filterable
                    clearable
                  >
                    <template #default="{ node, data }">
                      <span>{{ data.title }}</span>
                      <span v-if="!node.isLeaf"> ({{ data.children.length }}) </span>
                    </template>
                  </el-cascader>
                </el-form-item>
                <el-row :gutter="20">
                  <el-col :span="12">
                    <el-form-item label="菜单标题" prop="title">
                      <el-input v-model="pageData.form.title" placeholder="菜单标题"/>
                    </el-form-item>
                  </el-col>
                  <el-col :span="12">
                    <el-form-item label="菜单图标" prop="icon">
                      <ArtIconSelector
                        :iconType="iconType"
                        :defaultIcon="pageData.form.icon"
                        width="229px"
                        @get-icon="method.handleGetIcon"
                      />
                    </el-form-item>
                  </el-col>
                </el-row>
                <el-row :gutter="20">
                  <el-col :span="12">
                    <el-form-item label="菜单类型" prop="type">
                      <el-radio-group v-model="pageData.form.type">
                        <el-radio
                          v-for="(item, index) in artDict['菜单类型']"
                          :key="item.id"
                          :value="item.value"
                          border
                        >
                          {{ item.name }}
                        </el-radio>
                      </el-radio-group>
                    </el-form-item>
                  </el-col>
                </el-row>
                <el-row :gutter="20">
                  <el-col :span="12">
                    <el-form-item label="组件名称" prop="name">
                      <el-input v-model="pageData.form.name" placeholder="组件名称"/>
                    </el-form-item>
                  </el-col>
                  <el-col :span="12">
                    <el-form-item label="组件地址" prop="component">
                      <el-input v-model="pageData.form.component" placeholder="组件地址"/>
                    </el-form-item>
                  </el-col>
                </el-row>
                <el-row :gutter="20">
                  <el-col :span="12">
                    <el-form-item label="路由地址" prop="path">
                      <el-input v-model="pageData.form.path" placeholder="路由地址"/>
                    </el-form-item>
                  </el-col>
                  <el-col :span="12">
                    <el-form-item label="重定向地址" prop="redirect">
                      <el-input v-model="pageData.form.redirect" placeholder="重定向地址"/>
                    </el-form-item>
                  </el-col>
                </el-row>
                <el-row :gutter="20">
                  <el-col :span="5">
                    <el-form-item label="是否隐藏" prop="isHide">
                      <el-switch v-model="pageData.form.isHide"/>
                    </el-form-item>
                  </el-col>
                  <el-col :span="5">
                    <el-form-item label="是否缓存" prop="isKeepAlive">
                      <el-switch v-model="pageData.form.isKeepAlive"/>
                    </el-form-item>
                  </el-col>
                  <el-col :span="5">
                    <el-form-item label="是否全屏" prop="isFull">
                      <el-switch v-model="pageData.form.isFull"/>
                    </el-form-item>
                  </el-col>
                  <el-col :span="5">
                    <el-form-item label="是否固定" prop="isAffix">
                      <el-switch v-model="pageData.form.isAffix"/>
                    </el-form-item>
                  </el-col>
                </el-row>
                <el-form-item label="外链地址" prop="isLink">
                  <el-input v-model="pageData.form.isLink" placeholder="外链地址"/>
                </el-form-item>
                <el-row :gutter="20">
                  <el-col :span="12">
                    <el-form-item label="排序" prop="sort">
                      <el-input-number v-model="pageData.form.sort"/>
                    </el-form-item>
                  </el-col>
                  <el-col :span="12">
                    <el-form-item label="状态" prop="status">
                      <el-select v-model="pageData.form.status" placeholder="状态">
                        <el-option
                          v-for="item in artDict['状态']"
                          :label="item['label']"
                          :value="item['value']"
                        />
                      </el-select>
                    </el-form-item>
                  </el-col>
                </el-row>
                <el-form-item label="备注" prop="remark">
                  <el-input type="textarea" :rows="3" v-model="pageData.form.remark" placeholder="备注"/>
                </el-form-item>
              </el-form>
            </el-tab-pane>
            <el-tab-pane label="字段" name="字段">
              {{ pageData.form }}
            </el-tab-pane>
          </el-tabs>
          <template #footer>
            <div class="dialog-footer">
              <ElButton @click="pageData.dialogVisible = false">取消</ElButton>
              <ElButton type="primary" @click="method.handleSubmit">提交</ElButton>
            </div>
          </template>
        </el-dialog>

        <!-- 菜单按钮和列 -->
        <ArtDrawer
          ref="skyDrawerRef"
          title="添加按钮和列"
          size="50%"
          @skyConfirm="skyDrawerRef.skyQuickClose();"
          @skyCancel="skyDrawerRef.skyClose();"
        >
          <template #content>
            <el-tabs
              v-model="pageData.tabsMenu"
              type="card"
              class="demo-tabs"
            >
              <el-tab-pane label="菜单按钮" name="菜单按钮">
                <MenuButton
                  ref="menuButtonRef"
                  :menu_id="pageData.menu_id"
                  :dict-type-list="artDict"
                />
              </el-tab-pane>
              <el-tab-pane label="列表字段" name="列表字段">
                <MenuColumn
                  ref="menuColumnRef"
                  :menu_id="pageData.menu_id"
                  :dict-type-list="artDict"
                />
              </el-tab-pane>
            </el-tabs>
          </template>
        </ArtDrawer>
      </el-card>
    </div>
  </ArtTableFullScreen>
</template>

<style scoped lang="scss">

</style>
