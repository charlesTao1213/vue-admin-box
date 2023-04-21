<template>
  <Layer :layer="layer" @confirm="submit" ref="layerDom">
    <el-form :model="form" :rules="rules" ref="ruleForm" label-width="120px" style="margin-right:30px;">
      <el-form-item label="标题：" prop="title" style="margin-top: 10px">
        <el-input v-model="form.title" placeholder="请输入标题"></el-input>
      </el-form-item>
      <el-form-item label="作者：" prop="author" style="margin-top: 10px">
        <el-input v-model="form.author"
                  placeholder="作者"></el-input>
      </el-form-item>

      <el-form-item label="原文链接：" prop="originUrl" style="margin-top: 10px">
        <el-input v-model="form.originUrl"
                  placeholder="原文链接"></el-input>
      </el-form-item>

      <div v-for="(contentItem,index) in content" class="content-item">
        <div style="width: 100%">
          <el-form-item :label="'正文内容：'+(index+1)" prop="select">
            <el-select v-model="contentItem.type" placeholder="请选择类型" clearable>
              <el-option v-for="item in selectData" :key="item.value" :label="item.label"
                         :value="item.value"></el-option>
            </el-select>
          </el-form-item>
          <div v-if="contentItem.type == 1" class="textSelect">
            <el-form-item label="文字内容">
              <el-input v-model="contentItem.content" type="textarea" :rows="5" />
            </el-form-item>
          </div>
          <div v-else-if="contentItem.type == 2" class="picSelect">
            <el-upload
              :multiple=false
              ref="uploadRef"
              :auto-upload=false
              v-model:file-list="fileList[index]"

              class="upload-demo"
              :on-change="handleChange"
              :on-preview="handlePreview"
              :on-remove="handleRemove"
              list-type="picture"
            >
              <template #trigger>
                <el-button type="primary">选择文件</el-button>
              </template>
              <el-button class="ml-3" style="margin-left: 10px" type="success" @click="submitUpload(index)">
                上传
              </el-button>
            </el-upload>
          </div>
        </div>
        <el-button type="primary" :icon="Plus" @click="addContent(index)" circle style="margin-left: 20px" />
        <el-button type="primary" :icon="Minus" @click="removeContent(index,contentItem.type)" circle
                   style="margin-left: 20px" />

      </div>


      <!--      <el-form-item label="作者：" prop="select">-->
      <!--        <el-select v-model="form.choose" placeholder="请选择" clearable>-->
      <!--          <el-option v-for="item in selectData" :key="item.value" :label="item.label" :value="item.value"></el-option>-->
      <!--        </el-select>-->
      <!--      </el-form-item>-->
      <!--      <el-form-item label="单选框：" prop="radio">-->
      <!--        <el-radio-group v-model="form.radio">-->
      <!--          <el-radio v-for="item in radioData" :key="item.value" :label="item.value">{{ item.label }}</el-radio>-->
      <!--        </el-radio-group>-->
      <!--      </el-form-item>-->
    </el-form>
  </Layer>
</template>

<script lang="ts">
import type { LayerType } from "@/components/layer/index.vue";
import type { Ref } from "vue";
import type { ElFormItemContext } from "element-plus/lib/el-form/src/token";
import { defineComponent, ref } from "vue";
import { add, update } from "@/api/table";
import { selectData, radioData } from "./enum";
import Layer from "@/components/layer/index.vue";
import type { UploadProps, UploadUserFile, UploadInstance } from "element-plus";
import { ElMessage, ElMessageBox } from "element-plus";
import { getSign, sendFile } from "@/api/news/oss";
import axios from "axios";
import { UploadRawFile } from "element-plus/es/components/upload/src/upload";
import { Plus, Minus } from "@element-plus/icons";
import { create } from "@/api/news/news";
import { NewsInfo } from "@/views/main/pages/newsList/Types";

export interface UpLoadSignDTO {
  accessId: string;
  expire: string;
  host: string;
  keyPrefix: string;
  policy: string;
  signature: string;
}


export default defineComponent({
  components: {
    Layer
  },
  props: {
    layer: {
      type: Object,
      default: () => {
        return {
          show: false,
          title: "",
          showButton: true
        };
      }
    }
  },
  setup(props, ctx) {
    console.log(props.layer);
    const imgs: string[] = [];
    const dataUrl = ref("");
    const uploadRef = ref<UploadInstance>();

    const fileList = ref<[UploadUserFile[]]>([[]]);

    const content = ref([{}]);
    const ruleForm: Ref<ElFormItemContext | null> = ref(null);
    const layerDom: Ref<LayerType | null> = ref(null);
    let form = ref({
      name: "",
      title: "",
      content: {},
      author: "",
      originUrl: ""
    });
    const rules = {
      name: [{ required: true, message: "请输入姓名", trigger: "blur" }],
      number: [{ required: true, message: "请输入数字", trigger: "blur" }],
      choose: [{ required: true, message: "请选择", trigger: "blur" }],
      radio: [{ required: true, message: "请选择", trigger: "blur" }]
    };
    init();

    function init() { // 用于判断新增还是编辑功能
      if (props.layer.row) {
        form.value = JSON.parse(JSON.stringify(props.layer.row)); // 数量量少的直接使用这个转
      } else {

      }
    }

    const handleRemove: UploadProps["onRemove"] = (file, uploadFiles) => {
      console.log(file, uploadFiles);
    };

    const handlePreview: UploadProps["onPreview"] = (uploadFile) => {
      console.log(uploadFile);
    };


    const handleExceed: UploadProps["onExceed"] = (files, uploadFiles) => {
      ElMessage.warning(
        `The limit is 3, you selected ${files.length} files this time, add up to ${
          files.length + uploadFiles.length
        } totally`
      );
    };
    const handleChange: UploadProps["onChange"] = (uploadFile, uploadFiles) => {
      // fileList.value = fileList.value.slice(-3);
      console.error("handleChange", fileList.value);
    };
    const beforeRemove: UploadProps["beforeRemove"] = (uploadFile, uploadFiles) => {
      return ElMessageBox.confirm(
        `Cancel the transfer of ${uploadFile.name} ?`
      ).then(
        () => true,
        () => false
      );
    };

    const submitUpload = (index: number) => {
      const files: [UploadUserFile[]] = fileList.value;
      const file: UploadUserFile[] = files.at(index)!;
      let formData = new FormData();
      formData.append("file", file[0].raw!);
      sendFile(formData, 2).then(res => {
        res = res.data;
        if (res.code == 0) {

          ElMessage({
            message: "成功",
            type: "success",
            duration: 3 * 1000
          });
          imgs.push(res.url);
          content.value[index].picture = res.url;
        }
      });
      // getSign(1).then(res => {
      //   if (res.code == 0) {
      //     const signDTO: UpLoadSignDTO = res.uploadSignDTO;
      //     upload(signDTO, 1, file[0].raw!, file[0].name);
      //   }
      // });
    };

    const upload = (signDTO: UpLoadSignDTO, contentType: number, file: UploadRawFile, fileName: string) => {

      //   let config = {};
      //   let fd = new FormData();
      //   let fileSuf = "";
      //   if (contentType == 2) {
      //     fileSuf = "";
      //   } else {
      //     fileSuf = ".jpg";
      //   }
      //
      //   fd.append("key", signDTO.keyPrefix + "/" + Date.now() + fileSuf);
      //   fd.append("success_action_status", "200");
      //   fd.append("x-oss-object-acl", "public-read");
      //   fd.append("x-oss-meta-fullname", fileName);
      //   fd.append("OSSAccessKeyId", signDTO.accessId);
      //   fd.append("policy", signDTO.policy);
      //   fd.append("signature", signDTO.signature);
      //   fd.append("success_action_status", "200");
      //   fd.append("file", file);
      //
      //   // 数据组装完成后，发送上传请求到阿里云oss
      //   axios.post(signDTO.host, fd)
      //     .then((res) => {
      //       // 拿到结果后，做其他操作
      //       console.log("res", res);
      //     });
      //
    };
    const addContent = (index: number) => {
      content.value.splice(index + 1, 0, {});
    };
    const removeContent = (index: number, type: number) => {
      let count = 0;
      for (let i = 0; i < index; i++) {
        if (content.value[i].type == 2) {
          count++;
        }
      }
      console.error(imgs, count);
      if (type == 2) {
        imgs.splice(count, 1);
        fileList.value.splice(count, 1);
      }
      console.error(imgs);
      content.value.splice(index, 1);

      if (content.value.length == 0) {
        content.value.push({});
      }
    };
    return {
      form,
      rules,
      Plus,
      layerDom,
      ruleForm,
      selectData,
      radioData,
      content,
      fileList,
      handleRemove,
      handlePreview,
      handleExceed,
      beforeRemove,
      handleChange,
      submitUpload,
      uploadRef,
      upload,
      imgs,
      addContent,
      Minus,
      removeContent,
      dataUrl

    };
  },
  methods: {
    submit() {
      console.log(this.layer);
      if (this.ruleForm) {
        this.ruleForm.validate((valid) => {
          if (valid) {
            let params = this.form;
            if (this.layer.row) {
              this.updateForm(params);
            } else {
              this.addForm(params);
            }
          } else {
            return false;
          }
        });
      }
    }
    ,
    uploadContent(resolve: any, reject: any) {
      let temp: string = JSON.stringify(this.content);
      const blob = new Blob([temp]);
      let formData = new FormData();
      formData.append("file", new File([blob], ""));

      sendFile(formData, 1).then(res => {
        res = res.data;
        if (res.code == 0) {
          resolve();
          this.dataUrl = res.url;
        } else {
          reject();
        }
      });
    },
// 新增提交事件
    addForm(params: object) {
      console.error("add");
      console.error("content", this.content);
      console.error("img", this.imgs);
      new Promise((resolve, reject) => {
        this.uploadContent(resolve, reject);
      }).then(res => {
        const data: NewsInfo = {
          title: this.form.title,
          content: JSON.stringify(this.content),
          imgs: this.imgs.join(";"),
          originUrl: this.form.originUrl,
          author: this.form.author,
          dataUrl: this.dataUrl
        };
        console.error(data);
        create(data).then(res => {
          res = res.data;
          if (res.code == 0) {
            this.$message({
              type: "success",
              message: "新增成功"
            });
          }
          this.layerDom && this.layerDom.close();
          console.log("createRes", res);
        });
      });
      // add(params)
      //   .then(res => {
      //     this.$message({
      //       type: "success",
      //       message: "新增成功"
      //     });
      //     this.$emit("getTableData", true);
      //     this.layerDom && this.layerDom.close();
      //   });
    }
    ,
// 编辑提交事件
    updateForm(params: object) {
      update(params)
        .then(res => {
          this.$message({
            type: "success",
            message: "编辑成功"
          });
          this.$emit("getTableData", false);
          this.layerDom && this.layerDom.close();
        });
    }
  }
})
;
</script>

<style lang="scss" scoped>

.picSelect {
  display: flex;
  align-items: center;
  flex-direction: row;
  justify-content: center;
  margin-top: 10px;
}

.content-item {
  border: 1px solid pink;
  margin: 5px;
  padding: 5px;
  display: flex;
  align-items: center;
}

.el-form-item--small {
  margin-bottom: 0px;
}

.textSelect {
  margin-top: 10px;
}
</style>