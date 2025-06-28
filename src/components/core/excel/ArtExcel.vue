<script setup lang="ts">
import {ref} from "vue";
import request from "@/utils/http";
import {Download} from "@element-plus/icons-vue";
import {ElLoading, ElNotification, UploadRawFile} from "element-plus";
import {skyMsgSuccess, skyNoticeSuccess} from "@/utils/toast";

export interface IExcelParamsProps {
  title: string; // 标题
  isApi: boolean, // 是否后台上传
  fileType: string; // 类型
  fileSize?: number; // 上传文件的大小
  templeApi?: any; // 下载模板的Api
  importApi?: any; // 批量导入的Api
  importFun?: Function | undefined; // 导入方法
}

// 当前组件获取父组件传递的事件方法，然后点击确认和提交是触发父组件传递过来的事件
const emits = defineEmits(["handleTemplateExcel"]);

// 最大文件上传数
const excelLimit = ref(1);
// dialog状态
const dialogVisible = ref(false);
//限制.xls文件
const xlsFile = "application/vnd.ms-excel";
//限制.xlsx文件
const xlsxFile = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";

// 父组件传过来的参数
const ArtParams = ref<IExcelParamsProps>({
  title: "上传Excel",
  isApi: false,
  fileType: xlsFile + "," + xlsxFile,
  fileSize: 5,
  templeApi: "",
  importApi: "",
});

/** 接收父组件参数 */
const excelParams = (params: IExcelParamsProps) => {
  ArtParams.value = {...ArtParams.value, ...params};
  dialogVisible.value = true;
};

/** 下载文件 */
const handleTemplateExcel = () => {
  emits("handleTemplateExcel");
};
// 上传文件
const file = ref();
/** 文件上传 */
const handleHttpUpload = async (param: any) => {
  if (ArtParams.value?.isApi) {
    // 方法一：统一调用上传接口
    file.value = param.file;
  } else {
    // 方法二：返回上传方法，前端处理excel表
  }
};

// 上传
const handleConfirm = async () => {
  if (ArtParams.value.isApi) {
    const loading = ElLoading.service({
      lock: true,
      text: '数据导入中...',
      background: 'rgba(0, 0, 0, 0.7)',
    });
    // 统一调用上传接口
    let fileFormData = new FormData();
    fileFormData.append("file", file.value);
    if (typeof ArtParams.value?.importFun === 'function') {
      const res = await ArtParams.value.importFun(fileFormData);
      if (res?.code != 200) {
        ElNotification({
          title: "温馨提示",
          message: "上传失败，请重试！",
          type: "error"
        });
      } else {
        skyNoticeSuccess(res.msg);
      }
    }
    loading.close();
  }
  dialogVisible.value = false;
};
// 取消
const handleCancel = () => {
  dialogVisible.value = false;
};

/**
 * @description 文件上传之前判断
 * @param file 上传的文件
 * */
const beforeExcelUpload = (file: UploadRawFile) => {
  const isExcel = ArtParams.value.fileType!.includes(file.type);
  const fileSize = file.size / 1024 / 1024 < ArtParams.value.fileSize!;
  if (!isExcel)
    ElNotification({
      title: "温馨提示",
      message: "上传文件只能是xls / xlsx格式！",
      type: "warning"
    });
  if (!fileSize)
    setTimeout(() => {
      ElNotification({
        title: "温馨提示",
        message: `上传文件大小不能超过 ${ArtParams.value.fileSize}MB！`,
        type: "warning"
      });
    }, 0);
  return isExcel && fileSize;
};

/** 文件数超出提示 */
const handleExceed = () => {
  ElNotification({
    title: "温馨提示",
    message: "最多只能上传一个文件！",
    type: "warning"
  });
};

/** 上传错误提示 */
const handleUploadError = () => {
  ElNotification({
    title: "温馨提示",
    message: `${ArtParams.value.title}上传失败，请您重新上传！`,
    type: "error"
  });
};

/** 上传成功提示 */
const handleUploadSuccess = () => {
  ElNotification({
    title: "温馨提示",
    message: `${ArtParams.value.title}上传成功！`,
    type: "success"
  });
};

defineExpose({
  excelParams
});
</script>

<template>
  <el-dialog v-model="dialogVisible" :title="ArtParams.title" :destroy-on-close="true" width="580px" draggable>
    <el-form label-width="100px">
      <el-form-item label="模板下载：">
        <el-button type="primary" :icon="Download" @click="handleTemplateExcel">点击下载</el-button>
      </el-form-item>
      <el-form-item label="文件上传：">
        <el-upload
          action="#"
          class="upload"
          :drag="true"
          :limit="excelLimit"
          :multiple="false"
          :show-file-list="true"
          :http-request="handleHttpUpload"
          :before-upload="beforeExcelUpload"
          :on-exceed="handleExceed"
          :on-success="handleUploadSuccess"
          :on-error="handleUploadError"
          :accept="ArtParams.fileType"
        >
          <slot name="content">
            <el-icon class="el-icon--upload">
              <upload-filled/>
            </el-icon>
            <div class="el-upload__text">将文件拖到此处，或<em>点击上传</em></div>
          </slot>
          <template #tip>
            <slot name="tip">
              <div class="el-upload__tip">请上传 .xls, .xlsx 标准格式文件，文件最大为 {{ ArtParams.fileSize }}M</div>
            </slot>
          </template>
        </el-upload>
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button type="primary" @click="handleConfirm">上传</el-button>
      <el-button type="danger" @click="handleCancel">取消</el-button>
    </template>
  </el-dialog>
</template>

<style lang="scss" scoped>
:deep(.el-upload-dragger) {
  border: 2px dashed var(--el-color-primary-light-6);

  &:hover {
    border: 2px dashed var(--el-color-primary);
  }
}

.upload {
  width: 80%;
}
</style>
