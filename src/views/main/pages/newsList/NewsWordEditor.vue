<template>
  <div class="layout-container">
    <div class="layout-container-table">
      <Layer :layer="layer" @confirm="submit" ref="layerDom">
        <div>
          <el-text>标题：</el-text>
          <el-input v-model="title" placeholder="文章标题" style="width: 500px">
          </el-input>
        </div>
        <div style="margin-top: 20px">
          <el-text>作者：</el-text>
          <el-input v-model="author" placeholder="文章作者" style="width: 500px">
          </el-input>
        </div>

        <div style="margin-top: 20px">
          <el-text>原文链接：</el-text>
          <el-input v-model="originUrl" placeholder="原文链接" style="width: 500px">
          </el-input>
        </div>
        <div style="margin-top: 20px">
          <el-text>文章内容：</el-text>
          <tinymce v-model="word" style="margin-top: 20px"></tinymce>
        </div>
      </Layer>
    </div>
  </div>
</template>

<script lang="ts">
import Tinymce from "@/components/tinymce/index.vue";
import Layer from "@/components/layer/index.vue";
import { Ref, ref, defineComponent, inject } from "vue";
import type { LayerType } from "@/components/layer/index.vue";
import { createByHtml, getNewsInfo, updateNewsInfo } from "@/api/news/news";
import { ElMessage } from "element-plus";
import { NewsInfo } from "@/views/main/pages/newsList/Types";

export default defineComponent({
  name: "newsWordEditor",
  components: { Tinymce, Layer },
  props: {
    layer: {
      type: Object,
      default: () => {
        return {
          show: false,
          title: "",
          showButton: true,
          type: 1
        };
      }
    },
    newsId: {
      type: Number
    }
  },
  setup(props, ctx) {
    console.error("lay", props.layer.row);
    const word = ref("");
    const layerDom: Ref<LayerType | null> = ref(null);
    const title: Ref<String | undefined> = ref("");
    const author: Ref<String | undefined> = ref("");
    const originUrl: Ref<String | undefined> = ref("");
    const textLink: string = props.layer.row.textLink;
    const newsId = props.newsId;
    console.log("newId", newsId);
    let newsInfo: NewsInfo;
    const init = () => {
      if (props.layer.type == 2) {
        let parma = "newsId=" + newsId;
        getNewsInfo(parma).then(res => {
          res = res.data;
          if (res.code == 0) {
            newsInfo = res.newsInfo;
            title.value = newsInfo.title;
            author.value = newsInfo.author;
            originUrl.value = newsInfo.originUrl;
          }
        });
      }
    };
    init();

    const submit = () => {
      console.log("submit", props.layer.type);
      if (props.layer.type == 1) {
        create();
      } else {
        update();
      }
    };
    const create = () => {
      if (word.value != "" && word.value != null) {
        let data = {
          contentHtml: word.value,
          author: author.value,
          title: title.value,
          url: originUrl.value
        };
        createByHtml(data).then(res => {
          res = res.data;
          if (res.code == 0) {
            ElMessage({
              type: "success",
              message: "创建成功"
            });
            layerDom && layerDom.value?.close();
            ctx.emit("getTableData", false);
          }
          console.log("createByHtml res" + res);
        });
      }
    };
    const update = () => {
      if (word.value != "" && word.value != null) {
        let data = {
            content: word.value,
            author: author.value,
            title: title.value,
            linkUrl: textLink,
            originUrl: originUrl.value
          }
        ;
        console.log("update", data);
        updateNewsInfo(data).then(res => {
          res = res.data;
          if (res.code == 0) {
            ElMessage({
              type: "success",
              message: "修改成功"
            });
            layerDom && layerDom.value?.close();
            ctx.emit("getTableData", false);
          }
        });
      }

    };

    return {
      word,
      submit,
      layerDom,
      title,
      author,
      originUrl

    };
  }
});
</script>

<style scoped>

</style>