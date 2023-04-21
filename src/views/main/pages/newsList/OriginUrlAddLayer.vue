<template>
  <Layer :layer="layer" @confirm="submit" ref="layerDom">
    <el-form :model="form" ref="ruleForm" label-width="120px" style="margin-right:30px;">
      <el-form-item label="原文链接：" prop="originUrl" style="margin-top: 10px">
        <el-input v-model="form.originUrl" placeholder="请输入标题"></el-input>
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
    const layerDom: Ref<LayerType | null> = ref(null);
    let form = ref({
      originUrl: ""
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
      layerDom

    };
  },
  methods: {
    submit() {
      let params: NewsInfo = this.form;
      this.addForm(params);
    },
    addForm(params: NewsInfo) {
      console.log(params);
      let originUrl = params.originUrl;
      if (originUrl == "" || originUrl == undefined) {
        return;
      }
      let param = "source=weixin&" + "sourceUrl=" + originUrl;
      createByOriginUrl(param).then(res=>{
        res = res.data;
        if (res.code == 0) {
          this.$message({
            type: "success",
            message: "新增成功"
          });
        }
        this.layerDom && this.layerDom.close();
      })


      // update(params)
      //   .then(res => {
      //     this.$message({
      //       type: "success",
      //       message: "编辑成功"
      //     });
      //     this.$emit("getTableData", false);
      //     this.layerDom && this.layerDom.close();
      //   });
    }

  }
});

</script>

<style scoped>

</style>