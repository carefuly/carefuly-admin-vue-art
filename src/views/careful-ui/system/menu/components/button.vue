<script setup lang="ts">
import ArtButtonTable from "@/components/core/forms/ArtButtonTable.vue";
import {useCheckedColumns} from "@/composables/useCheckedColumns";
import {skyMsgBox, skyMsgError, skyMsgInfo, skyMsgWarning, skyNoticeError, skyNoticeSuccess} from "@/utils/toast";
import {MenuButtonService} from "@/api/careful-ui/system/menu/menu_button";

interface DictItem {
  value: any;   // 根据实际情况，value可以是string, number等
  label: any;
  dictTag: string;
  // ...其他属性
}

const props = withDefaults(
  defineProps<{
    menu_id: string
    dictTypeList: {
      [key: string]: DictItem[];
    }
  }>(),
  {
    menu_id: "",
  },
);

const dictNames = ["接口请求方法", "状态"];
let artDict: any = reactive({
  "接口请求方法": [],
  "状态": [],
});

// 定义表单搜索初始值
const initialSearchState = {
  name: "",
  code: "",
  menu_id: "",
  status: true,
};
const tabs = ref("表单");
const formRef = ref();
const pageData = reactive({
  menu_id: "",
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
    api: "",
    method: null,
    menu_id: "",
    sort: 1,
    status: true,
    remark: "",
  },
  rules: {
    name: [
      {required: true, message: '请输入按钮名称', trigger: 'blur'},
      {min: 1, max: 100, message: '长度在 1 到 64 个字符', trigger: 'blur'}
    ],
    code: [
      {required: true, message: '请输入按钮权限值', trigger: 'blur'},
      {min: 1, max: 100, message: '长度在 1 到 64 个字符', trigger: 'blur'}
    ],
    api: [
      {required: true, message: '请输入接口地址', trigger: 'blur'},
      {min: 1, max: 100, message: '长度在 1 到 255 个字符', trigger: 'blur'}
    ],
    method: [
      {required: true, message: '请选择请求方式', trigger: 'blur'},
    ],
  },
  ids: [],
  loading: false,
  columnOptions: [
    {label: '勾选', type: 'selection'},
    {label: '按钮名称', prop: 'name'},
    {label: '权限值', prop: 'code'},
    {label: '接口地址', prop: 'api'},
    {label: '请求方式', prop: 'method'},
    {label: '状态', prop: 'status'},
    {label: '备注', prop: 'remark'},
  ],
  total: 0,
  tableList: [],
});
const method = reactive({
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
      pageData.form.api = "";
      pageData.form.method = null;
      pageData.form.menu_id = pageData.menu_id;
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
          await MenuButtonService.delete(id);
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
          await MenuButtonService.batchDelete(pageData.ids);
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
      const res = await MenuButtonService.getById(id);
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
        pageData.form.menu_id = props.menu_id;

        if (pageData.form.id) {
          try {
            await MenuButtonService.update(pageData.form);
            skyNoticeSuccess("修改成功🌻");
          } catch (error) {
            skyNoticeError(`修改失败，请刷新重试🌻【${error}】`);
          }
        } else {
          try {
            await MenuButtonService.create(pageData.form);
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
      pageData.formFilters.menu_id = props.menu_id;
      const res = await MenuButtonService.listPage({
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
// 获取字典类型
const handleDictTypeTag = (value: any, dictName: string) => {
  const radio = props.dictTypeList[dictName].find((item: any) => item.value.toString() === value.toString());
  return radio?.dictTag;
};
// 获取字典文本
const handleDictTextTag = (value: any, dictName: string) => {
  const radio = props.dictTypeList[dictName].find((item: any) => item.value.toString() === value.toString());
  return radio?.label;
};
// 动态列配置
const {columnChecks, columns} = useCheckedColumns(() => [
  {type: 'selection'}, // 勾选列
  {label: '按钮名称', prop: 'name', width: 100},
  {label: '权限值', prop: 'code', width: 100},
  {label: '接口地址', prop: 'api', width: 150},
  {
    label: '请求方式',
    prop: 'method',
    width: 100,
    formatter: (row: any) => {
      return h(ElTag, {type: handleDictTypeTag(row.method, '接口请求方法')}, () => handleDictTextTag(row.method, '接口请求方法'))
    }
  },
  {
    label: '状态',
    prop: 'status',
    width: 100,
    formatter: (row: any) => {
      return h(ElTag, {type: handleDictTypeTag(row.status, '状态')}, () => handleDictTextTag(row.status, '状态'))
    }
  },
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

// 暴露方法给父组件
defineExpose({
  handleListPage: method.handleListPage,
});
</script>

<template>
  <ArtTableFullScreen>
    <div class="page" id="table-full-screen">
      <!-- 表格头部 -->
      <ArtTableHeader
        :columnList="pageData.columnOptions"
        v-model:columns="columnChecks"
        @refresh="method.handleRefresh"
      >
        <template #left>
          <el-button @click="method.showDialog('add')">新增</el-button>
          <el-button type="danger" plain @click="method.handleBatchDelete">删除</el-button>
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
              <el-form-item label="按钮名称" prop="name">
                <el-input v-model="pageData.form.name" placeholder="按钮名称"/>
              </el-form-item>
              <el-form-item label="权限值" prop="code">
                <el-input v-model="pageData.form.code" placeholder="权限值"/>
              </el-form-item>
              <el-form-item label="接口地址" prop="code">
                <el-input v-model="pageData.form.api" placeholder="接口地址"/>
              </el-form-item>
              <el-form-item label="请求方式" prop="type">
                <el-select v-model="pageData.form.method" placeholder="请求方式">
                  <el-option
                    v-for="item in props.dictTypeList['接口请求方法']"
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
                    v-for="item in props.dictTypeList['状态']"
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
    </div>
  </ArtTableFullScreen>
</template>

<style scoped lang="scss">

</style>
