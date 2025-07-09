<script setup lang="ts">
import ArtButtonTable from "@/components/core/forms/ArtButtonTable.vue";
import {useCheckedColumns} from "@/composables/useCheckedColumns";
import {useDictAll} from "@/hooks/dict";
import {SearchChangeParams, SearchFormItem} from '@/types';
import {skyMsgBox, skyMsgSuccess, skyMsgError, skyMsgInfo, skyMsgWarning, skyNoticeError, skyNoticeSuccess} from "@/utils/toast";
import {DictService} from "@/api/careful-ui/tools/dict";

const {artDict} = useDictAll(["字典类型", "数据类型", "状态"]);

// 定义表单搜索初始值
const initialSearchState = {
  name: "",
  code: "",
  type: null,
  valueType: null,
  status: true,
};
const tabs = ref("表单");
const formRef = ref();
const skyExcelRef = ref();
const pageData = reactive({
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
  form: {
    id: null,
    name: "",
    code: "",
    type: 1,
    valueType: 1,
    sort: 1,
    status: true,
    remark: "",
  },
  rules: {
    name: [
      {required: true, message: '请输入字典名称', trigger: 'blur'},
      {min: 1, max: 100, message: '长度在 1 到 20 个字符', trigger: 'blur'}
    ],
    code: [
      {required: true, message: '请输入字典编码', trigger: 'blur'},
      {min: 1, max: 100, message: '长度在 1 到 20 个字符', trigger: 'blur'}
    ],
  },
  ids: [],
  loading: false,
  columnOptions: [
    {label: '勾选', type: 'selection'},
    {label: '字典名称', prop: 'name'},
    {label: '字典编码', prop: 'code'},
    {label: '字典分类', prop: 'type'},
    {label: '数据类型', prop: 'valueType'},
    {label: '状态', prop: 'status'},
    {label: '创建时间', prop: 'create_time'},
    {label: '备注', prop: 'remark'},
    {label: '操作', prop: 'operation'}
  ],
  total: 0,
  tableList: [],
});
const method = reactive({
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
      pageData.form.name = "";
      pageData.form.code = "";
      pageData.form.type = 1;
      pageData.form.valueType = 1;
      pageData.form.sort = 1;
      pageData.form.status = true;
      pageData.form.remark = "";
    }
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
          await DictService.delete(id);
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
          await DictService.batchDelete(pageData.ids);
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
  /** 回显数据 */
  async handleEcho(id: any) {
    if (id === null || id === "") {
      skyMsgWarning("请选择需要修改的数据🌻");
      return;
    }
    try {
      const res = await DictService.getById(id);
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
            await DictService.update(pageData.form);
            skyNoticeSuccess("修改成功🌻");
          } catch (error) {
            skyNoticeError(`修改失败，请刷新重试🌻【${error}】`);
          }
        } else {
          try {
            await DictService.create(pageData.form);
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
  /** 导入 */
  handleImportExcel() {
    let params = {
      title: "导入数据",
      isApi: true, // 是否后台上传
      importFun: DictService.import,
    };
    skyExcelRef.value.excelParams(params);
  },
  /** 导入 */
  handleConfirmUpload() {
    method.handleListPage();
  },
  /** 下载模板 */
  handleTemplateExcel() {
    window.location.href = import.meta.env.VITE_GLOB_API_URL + "/static/templates/import/导入模板.xlsx";
    skyMsgSuccess("模板下载成功🌻");
  },
  /** 导出 */
  async handleDownload() {
    const res: any = await DictService.export(pageData.formFilters);
    // 创建下载链接
    const url = window.URL.createObjectURL(
      new Blob([res],
        {type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'})
    );
    // 创建下载链接
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `数据字典导出_${new Date().toLocaleString()}.xlsx`);
    document.body.appendChild(link);
    // 触发下载
    link.click();
    // 清理
    window.URL.revokeObjectURL(url);
    link.remove();

    skyMsgSuccess("导出成功🌻");
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
      const res = await DictService.listPage({
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
    label: '字典名称',
    prop: 'name',
    type: 'input',
    config: {
      clearable: true
    },
    onChange: method.handleFormChange,
  },
  {
    label: '字典编码',
    prop: 'code',
    type: 'input',
    config: {
      clearable: true
    },
    onChange: method.handleFormChange,
  },
  {
    label: '字典类型',
    prop: 'type',
    type: 'select',
    config: {
      clearable: true
    },
    options: () => artDict['字典类型'],
    onChange: method.handleFormChange
  },
  {
    label: '数据类型',
    prop: 'valueType',
    type: 'select',
    config: {
      clearable: true
    },
    options: () => artDict['数据类型'],
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
  {label: '字典名称', prop: 'name'},
  {label: '字典编码', prop: 'code'},
  {label: '字典分类', prop: 'type'},
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
  method.handleListPage();
});
</script>

<template>
  <ArtTableFullScreen>
    <div class="page art-full-height" id="table-full-screen">
      <!-- 搜索栏 -->
      <ArtSearchBar
        v-model:filter="pageData.formFilters"
        :items="formItems"
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
            <el-button @click="method.showDialog('add')">新增</el-button>
            <el-button type="danger" plain @click="method.handleBatchDelete">删除</el-button>
            <el-button type="success" plain @click="method.handleImportExcel">导入</el-button>
            <el-button type="warning" plain @click="method.handleDownload">导出</el-button>
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
            <el-tab-pane label="表单" name="表单">
              <el-form ref="formRef" :model="pageData.form" :rules="pageData.rules" label-width="80px">
                <el-form-item label="字典名称" prop="name">
                  <el-input v-model="pageData.form.name" placeholder="字典名称" :disabled="pageData.dialogType === 'edit'"/>
                </el-form-item>
                <el-form-item label="字典编码" prop="code">
                  <el-input v-model="pageData.form.code" placeholder="字典编码"/>
                </el-form-item>
                <el-form-item label="字典类型" prop="type">
                  <el-select v-model="pageData.form.type" placeholder="字典类型" :disabled="pageData.dialogType === 'edit'">
                    <el-option
                      v-for="item in artDict['字典类型']"
                      :label="item['label']"
                      :value="item['value']"
                    />
                  </el-select>
                </el-form-item>
                <el-form-item label="数据类型" prop="valueType">
                  <el-select v-model="pageData.form.valueType" placeholder="数据类型" :disabled="pageData.dialogType === 'edit'">
                    <el-option
                      v-for="item in artDict['数据类型']"
                      :label="item['label']"
                      :value="item['value']"
                    />
                  </el-select>
                </el-form-item>
                <el-form-item label="排序" prop="sort">
                  <el-input-number v-model="pageData.form.sort"/>
                </el-form-item>
                <el-form-item label="状态" prop="status">
                  <el-select v-model="pageData.form.status" placeholder="状态">
                    <el-option
                      v-for="item in artDict['状态']"
                      :label="item['label']"
                      :value="item['value']"
                    />
                  </el-select>
                </el-form-item>
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
      </el-card>
    </div>
    <!-- excel导入 -->
    <ArtExcel
      ref="skyExcelRef"
      @handleTemplateExcel="method.handleTemplateExcel"
      @handleConfirmUpload="method.handleConfirmUpload"
    />
  </ArtTableFullScreen>
</template>

<style scoped lang="scss">

</style>
