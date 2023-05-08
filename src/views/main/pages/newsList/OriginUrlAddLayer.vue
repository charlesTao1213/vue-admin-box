<template>
  <Layer :layer="layer" @confirm="submit" ref="layerDom">
    <el-form :model="form" ref="ruleForm" label-width="120px" style="margin-right:30px;">
      <el-form-item label="原文链接：" prop="originUrl" style="margin-top: 10px">
        <el-input v-model="form.originUrl" placeholder="请输入原文链接"></el-input>
      </el-form-item>

      <el-form-item label="来源类型" prop="source">
        <el-select v-model="form.source" class="m-2" placeholder="文章来源" size="small">
          <el-option
            v-for="item in sourceOption"
            :key="item.value"
            :label="item.label"
            :value="item.value"
            :disabled="item.disabled"
          />
        </el-select>
      </el-form-item>
    </el-form>
  </Layer>
</template>

<script lang="ts">
import type { LayerType } from "@/components/layer/index.vue";
import type { Ref } from "vue";
import { defineComponent, ref } from "vue";
import Layer from "@/components/layer/index.vue";
import type { UploadProps, UploadUserFile, UploadInstance } from "element-plus";
import { NewsInfo } from "@/views/main/pages/newsList/Types";
import { createByOriginUrl } from "@/api/news/news";
import { ElLoading } from "element-plus";

export interface UrlCreateNewsInfo extends NewsInfo {
  source: string;
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
    const sourceOption = ref([{
      label: "微信公众号",
      value: "weixin"
    }, {
      label: "其他",
      value: "other",
      disabled: true
    }]);
    console.log(props.layer);
    const layerDom: Ref<LayerType | null> = ref(null);
    let form = ref({
      originUrl: "",
      source: ""
    });

    init();

    function init() { // 用于判断新增还是编辑功能
      if (props.layer.row) {
        form.value = JSON.parse(JSON.stringify(props.layer.row)); // 数量量少的直接使用这个转
      } else {

      }
    }

    return {
      form,
      layerDom,
      sourceOption

    };
  },
  methods: {
    openLoading() {
      const loading = ElLoading.service({
        lock: true,
        text: "Loading",
        background: "rgba(0, 0, 0, 0.7)"
      });

      setTimeout(() => {
        loading.close();
      }, 10000);
      return loading;
    },
    submit() {
      let params: UrlCreateNewsInfo = this.form;
      this.addForm(params);
    },
    addForm(params: UrlCreateNewsInfo) {
      console.log(params);
      let originUrl = params.originUrl;
      if (originUrl == "" || originUrl == undefined) {
        return;
      }
      originUrl = encodeURIComponent(originUrl);
      let source = params.source;
      if (source == "" || source == undefined) {
        return;
      }
      let loading = this.openLoading();
      let param = "source=" + source + "&" + "sourceUrl=" + originUrl;
      createByOriginUrl(param).then(res => {
        res = res.data;
        if (res.code == 0) {
          this.$message({
            type: "success",
            message: "新增成功"
          });
        }
        this.layerDom && this.layerDom.close();
        this.$emit("getTableData", false, "", "");
      }).catch(() => {
        this.$message({
          type: "error",
          message: "新增失败"
        });
      }).finally(() => {
        loading.close();
      });
    }

  }
});

</script>

<style scoped>

</style>