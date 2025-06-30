<script setup lang="ts">
import ArtButtonTable from "@/components/core/forms/ArtButtonTable.vue";
import {useCheckedColumns} from "@/composables/useCheckedColumns";
import {useScreenStore} from "@/hooks/screen";
import {SearchChangeParams, SearchFormItem} from '@/types';
import {skyMsgBox, skyMsgSuccess, skyMsgError, skyMsgInfo, skyMsgWarning, skyNoticeError, skyNoticeSuccess} from "@/utils/toast";
import {DictService} from "@/api/careful-ui/tools/dict";
import {DictTypeService} from "@/api/careful-ui/tools/dict_type";

const {isMobile} = useScreenStore();

// 定义表单搜索初始值
const initialSearchState = {
  name: "",
  dictTag: "",
  dictName: "",
  valueType: null,
  dict_id: "",
  status: true,
};
const tabs = ref("form");
const formRef = ref();
const skyExcelRef = ref();
const pageData = reactive({
  treeLoading: false,
  treeList: [],
  props: {children: "children", label: "name"},
  key: "id",
  pagination: {
    page: 1,
    pageSize: 15,
    Creator: null,
    Modifier: null,
  },
  formFilters: {...initialSearchState},
  confirmLoading: false,
  dialogVisible: false,
  dialogType: "add",
  tabs: "form",
  form: {
    id: null,
    name: "",
    strValue: null,
    intValue: null,
    boolValue: null,
    dictTag: "primary",
    dictColor: "",
    valueType: 1,
    dict_id: null,
    sort: 1,
    status: true,
    remark: "",
  },
  rules: {
    name: [
      {required: true, message: '请输入字典项名', trigger: 'blur'},
      {min: 1, max: 100, message: '长度在 1 到 50 个字符', trigger: 'blur'}
    ],
    dict_id: [
      {required: true, message: '请选择数据字典', trigger: 'blur'},
    ],
  },
  ids: [],
  mobile: false,
  isTree: true,
  loading: false,
  columnOptions: [],
  total: 0,
  tableList: [],
});
const method = reactive({
  /** 数据字典树 */
  async handleListTree() {
    pageData.treeLoading = true;
    pageData.treeList = [];
    try {
      const res = await DictService.listAll();
      pageData.treeList = res.data;
    } catch (error) {
      skyMsgError(`数据查询失败，请刷新重试🌻【${error}】`);
    } finally {
      pageData.treeLoading = false;
    }
  },
  /** 选择数据字典树 */
  handleNodeClick(data: any) {
    pageData.formFilters.dict_id = data.id;
    pageData.formFilters.dictName = data.name;
    pageData.pagination.page = 1;
    pageData.pagination.pageSize = 15;
    method.handleListPage();
  },
  /** 显示树或隐藏树 */
  handleIsTreeOrTable: () => {
    setTimeout(() => {
      pageData.mobile = !pageData.mobile;
      pageData.isTree = !pageData.isTree;
    }, 500);
    skyMsgSuccess("切换成功");
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
    tabs.value = "form";
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
      pageData.form.name = "";
      pageData.form.strValue = null;
      pageData.form.intValue = null;
      pageData.form.boolValue = null;
      pageData.form.dictTag = "primary";
      pageData.form.dictColor = "";
      pageData.form.valueType = 1;
      pageData.form.dict_id = null;
      pageData.form.sort = 1;
      pageData.form.status = true;
      pageData.form.remark = "";
    }
  },
  /** 选择所属字典 */
  handleDictIdChange: (id: string) => {
    const radio: any = pageData.treeList.find((item: any) => item.id === id);
    pageData.form.dict_id = radio.id;
    pageData.form.valueType = radio.valueType;
    pageData.form.remark = radio.remark;
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
          await DictTypeService.delete(id);
          skyNoticeSuccess("删除成功🌻");
        } catch (error) {
          skyNoticeError("删除失败，请刷新重试🌻");
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
          await DictTypeService.batchDelete(pageData.ids);
          skyNoticeSuccess(`批量删除成功🌻`);
        } catch (error) {
          skyNoticeSuccess("批量删除失败，请刷新重试🌻");
        } finally {
          await method.handleListPage();
        }
      })
      .catch(() => {
        skyMsgError("已取消🌻");
      });
  },
  /** 回显数据 */
  async handleEcho(id: any) {
    if (id === null || id === "") {
      skyMsgWarning("请选择需要修改的数据🌻");
      return;
    }
    try {
      const res = await DictTypeService.getById(id);
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
            await DictTypeService.update(pageData.form);
            skyNoticeSuccess("修改成功🌻");
          } catch (error) {
            skyNoticeError(`修改失败，请刷新重试🌻【${error}】`);
          }
        } else {
          try {
            await DictTypeService.create(pageData.form);
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
      const res = await DictTypeService.listPage({
        ...pageData.pagination,
        ...pageData.formFilters
      });
      pageData.total = res.data.total;
      pageData.tableList = res.data.list;
    } catch (error) {
      skyMsgError(`数据查询失败，请刷新重试🌻【${error}】`);
    } finally {
      pageData.loading = false;
    }
  },
  /** 页数 */
  handleSizeChange(newPageSize: number) {
    pageData.pagination.pageSize = newPageSize;
    method.handleListPage();
  },
  /** 分页 */
  handlePageChange(newPage: number) {
    pageData.pagination.page = newPage;
    method.handleListPage();
  },

});
// 表单配置项
const formItems: SearchFormItem[] = [
  {
    label: '字典项名',
    prop: 'name',
    type: 'input',
    config: {
      clearable: true
    },
    onChange: method.handleFormChange,
  },
  {
    label: '标签类型',
    prop: 'dictTag',
    type: 'select',
    config: {
      clearable: true
    },
    options: () => [
      {label: 'primary', value: "primary"},
      {label: 'success', value: "success"},
      {label: 'warning', value: "warning"},
      {label: 'danger', value: "danger"},
      {label: 'info', value: "info"},
    ],
    onChange: method.handleFormChange
  },
  {
    label: '数据类型',
    prop: 'valueType',
    type: 'select',
    config: {
      clearable: true
    },
    options: () => [
      {label: '字符串', value: 1},
      {label: '整型', value: 2},
      {label: '布尔', value: 3},
    ],
    onChange: method.handleFormChange
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
  {label: '字典项名称', prop: 'name'},
  {label: '字符串-值', prop: 'strValue'},
  {label: '整型-值', prop: 'intValue'},
  {label: '布尔-值', prop: 'boolValue'},
  {label: '标签类型', prop: 'dictTag'},
  {label: '标签颜色', prop: 'dictColor'},
  {label: '字典名称', prop: 'dictName'},
  {label: '数据类型', prop: 'valueType'},
  {label: '状态', prop: 'status'},
  {label: '创建时间', prop: 'createTime'},
  {label: '备注', prop: 'remark'},
  {
    prop: 'operation',
    label: '操作',
    width: 150,
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
        })
      ])
    }
  }
]);

onMounted(() => {
  pageData.mobile = isMobile.value;
  method.handleListTree();
});
</script>

<template>
  <ArtTableFullScreen style="display: flex;">
    <div
      v-if="pageData.isTree"
      :style="{width: pageData.mobile ? '100%' : '25%'}" class="dict-page mr2"
      id="table-full-screen"
    >
      <el-card shadow="never" class="art-table-card">
        <h3>
          数据字典控件
          <el-button
            v-if="pageData.mobile"
            size="small"
            @click="method.handleIsTreeOrTable"
          >
            显示表格
          </el-button>
        </h3>
        <ArtSingleTree
          title="数据字典"
          :loading="pageData.treeLoading"
          :data="pageData.treeList"
          :node-props="pageData.props"
          :node-key="pageData.key"
          :highlight-current="true"
          @refresh="method.handleListTree"
          @node-click="method.handleNodeClick"
        />
      </el-card>
    </div>
    <div
      v-if="!pageData.mobile"
      :style="{width: !pageData.mobile ? '100%' : '75%'}"
      class="dict-page" id="table-full-screen"
    >
      <el-card shadow="never" class="art-table-card">
        <el-button
          v-if="isMobile"
          class="mb2"
          size="small"
          @click="method.handleIsTreeOrTable"
        >
          显示树
        </el-button>
        <!-- 搜索栏 -->
        <ArtSearchBar
          v-model:filter="pageData.formFilters"
          :items="formItems"
          @reset="method.handleSearchReset"
          @search="method.handleSearch"
        />
        <br/>

        <!-- 表格头部 -->
        <ArtTableHeader
          :columnList="pageData.columnOptions"
          v-model:columns="columnChecks"
          @refresh="method.handleRefresh"
        >
          <template #left>
            <el-button @click="method.showDialog('add')">新增</el-button>
            <el-button type="danger" plain @click="method.handleBatchDelete">删除</el-button>
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
          :currentPage="pageData.pagination.page"
          :pageSize="pageData.pagination.pageSize"
          :total="pageData.total"
          :marginTop="10"
          @selection-change="method.handleSelectionChange"
          @size-change="method.handleSizeChange"
          @current-change="method.handlePageChange"
        >
          <template #default>
            <el-table-column v-for="col in columns" :key="col.prop || col.type" v-bind="col" show-overflow-tooltip/>
          </template>
        </ArtTable>

        <!-- 表单 -->
        <el-dialog
          v-model="pageData.dialogVisible"
          :title="pageData.dialogType === 'add' ? '添加' : '编辑'"
          width="30%"
          align-center
        >
          <el-tabs type="border-card" v-model="tabs">
            <el-tab-pane label="form" name="form">
              <el-form ref="formRef" :model="pageData.form" :rules="pageData.rules" label-width="80px">
                <el-form-item label="所属字典" prop="dict_id">
                  <el-select
                    v-model="pageData.form.dict_id"
                    filterable
                    placeholder="所属字典"
                    :disabled="pageData.dialogType === 'edit'"
                    @change="method.handleDictIdChange"
                  >
                    <el-option
                      v-for="item in pageData.treeList"
                      :key="item['id']"
                      :label="item['name']"
                      :value="item['id']"
                    />
                  </el-select>
                </el-form-item>
                <el-form-item label="字典项名" prop="name">
                  <el-input v-model="pageData.form.name" placeholder="字典项名"/>
                </el-form-item>
                <el-form-item label="字典项值" prop="strValue">
                  <el-input
                    v-if="pageData.form.valueType === 1"
                    v-model="pageData.form.strValue"
                    placeholder="字典项值"
                    :disabled="pageData.dialogType === 'edit'"
                  />
                  <el-input-number
                    v-if="pageData.form.valueType === 2"
                    v-model="pageData.form.intValue"
                    placeholder="字典项值"
                    :disabled="pageData.dialogType === 'edit'"
                  />
                  <el-select
                    v-if="pageData.form.valueType === 3"
                    v-model="pageData.form.boolValue" placeholder="字典项值"
                    :disabled="pageData.dialogType === 'edit'"
                  >
                    <el-option label="true" :value="true"/>
                    <el-option label="false" :value="false"/>
                  </el-select>
                </el-form-item>
                <el-form-item label="标签类型" prop="dictTag">
                  <el-select v-model="pageData.form.dictTag" placeholder="标签类型">
                    <el-option label="primary" value="primary"/>
                    <el-option label="success" value="success"/>
                    <el-option label="warning" value="warning"/>
                    <el-option label="danger" value="danger"/>
                    <el-option label="info" value="info"/>
                  </el-select>
                </el-form-item>
                <el-form-item label="标签颜色" prop="dictColor">
                  <el-input v-model="pageData.form.dictColor" placeholder="标签颜色"/>
                </el-form-item>
                <el-form-item label="排序" prop="sort">
                  <el-input-number v-model="pageData.form.sort"/>
                </el-form-item>
                <el-form-item label="状态" prop="status">
                  <el-select v-model="pageData.form.status" placeholder="字典分类">
                    <el-option label="启用" :value="true"/>
                    <el-option label="禁用" :value="false"/>
                  </el-select>
                </el-form-item>
                <el-form-item label="备注" prop="remark">
                  <el-input type="textarea" :rows="3" v-model="pageData.form.remark" placeholder="备注"/>
                </el-form-item>
              </el-form>
            </el-tab-pane>
            <el-tab-pane label="json" name="json">
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
      </el-card>
    </div>
  </ArtTableFullScreen>
</template>

<style scoped lang="scss">

</style>
