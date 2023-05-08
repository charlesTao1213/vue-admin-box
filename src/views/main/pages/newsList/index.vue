<template>
  <div class="full">
    <div class="top">
      <div class="selectCreateTime">
        <el-text class="mx-1" type="primary" style="margin-right: 15px"
          >录入时间选择
        </el-text>
        <el-date-picker
          v-model="searchDate"
          type="daterange"
          range-separator="-"
          start-placeholder="开始时间"
          end-placeholder="结束时间"
          format="YYYY/MM/DD"
          value-format="YYYY-MM-DD HH:mm:ss"
          size="default"
          @change="getTableData(false)"
        />
      </div>
      <div style="display: flex; align-items: center">
        <el-text class="mx-1" type="primary" style="width: 100px">
          文章标题查询
        </el-text>
        <el-input
          @change="handleSearch"
          v-model="searchTitle"
          style="width: 300px"
        >
        </el-input>
      </div>
      <div style="margin-left: 30px">
        <el-button type="primary" :icon="Search" @click="handleSearch">{{
          $t("message.common.search")
        }}</el-button>
      </div>
    </div>
    <div class="content">
      <div class="layout-container">
        <div class="layout-container-form flex space-between">
          <div class="layout-container-form-handle">
            <el-button type="primary" :icon="Plus" @click="handleAdd">{{
              $t("message.common.formAdd")
            }}</el-button>

            <el-button type="danger" :icon="Plus" @click="handleUrlAdd"
              >{{ $t("message.common.originUrlAdd") }}
            </el-button>
            <el-button type="warning" :icon="Plus" @click="handlerHtmlAdd"
              >{{ $t("message.common.htmlAdd") }}
            </el-button>
            <!--            <div style="display: flex;align-items: center;">-->
            <!--              <el-text class="mx-1" type="primary" style="width: 100px;margin-left: 50px"-->
            <!--              >默认链接前缀-->
            <!--              </el-text>-->
            <!--              <el-input v-model="defaultLinkPrefix" :placeholder="defaultLinkPrefix" style="width: 500px">-->
            <!--              </el-input>-->
            <!--            </div>-->
          </div>
        </div>
        <div class="layout-container-table">
          <Table
            ref="table"
            v-model:page="page"
            v-loading="loading"
            :data="tableData"
            :sort-change="handleSort"
            @getTableData="getTableData"
            @selection-change="handleSelectionChange"
          >
            <el-table-column
              :label="$t('message.common.handle')"
              align="center"
              fixed="left"
              width="100"
            >
              <template #default="scope">
                <el-button @click="handleEdit(scope.row)">{{
                  $t("message.common.update")
                }}</el-button>
              </template>
            </el-table-column>
            <el-table-column prop="id" align="center" width="100">
              <template #header>
                <el-text>id</el-text>
                <el-button
                  style="margin-left: 5px"
                  :icon="Sort"
                  text
                  @click="handleSort('id')"
                />
              </template>
            </el-table-column>

            <el-table-column prop="newsId" label="newsId" align="center" />
            <el-table-column prop="title" label="标题" align="center" />
            <el-table-column
              prop="textLink"
              label="链接"
              align="center"
              width="150"
            >
              <template #default="scope">
                <el-text>{{ scope.row.textLink }}</el-text>
                <el-button
                  type="primary"
                  @click="handleCopy(scope.row.textLink)"
                  style="margin-left: 10px"
                >
                  {{ $t("message.common.copy") }}
                </el-button>
              </template>
            </el-table-column>
            <el-table-column
              prop="linkState"
              label="状态"
              align="center"
              width="80"
            >
              <template #default="scope">
                <el-text>{{
                  scope.row.linkState == 0 ? "正常" : "停用"
                }}</el-text>
              </template>
            </el-table-column>
            <el-table-column prop="createTime" align="center">
              <template #header>
                <el-text>创建时间</el-text>
                <el-button
                  style="margin-left: 5px"
                  :icon="Sort"
                  text
                  @click="handleSort('createTime')"
                />
              </template>
            </el-table-column>

            <el-table-column
              prop="updateTime"
              label="更新时间"
              align="center"
            />
          </Table>
          <Layer
            id="nomalAdd"
            :layer="layer"
            @getTableData="getTableData"
            v-if="layer.show"
          />

          <OriginUrlAddLayer
            id="urlAddLayer"
            :layer="urlAddLayer"
            @getTableData="getTableData"
            v-if="urlAddLayer.show"
          />
          <NewsWordEditor
            id="newsWordEditor"
            :layer="newsWordEditorLayer"
            :news-id="currentNewsId"
            v-if="newsWordEditorLayer.show"
            @getTableData="getTableData"
          ></NewsWordEditor>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, provide, reactive, ref } from "vue";
// import myTable from "@/views/main/pages/categoryTable/my-table.vue";
import newsTable from "@/views/main/pages/categoryTable/news-table.vue";
import { getData } from "@/api/news/news";
import { Page } from "@/components/table/type";
import { Delete, Plus, Search, Sort } from "@element-plus/icons";
import Table from "@/components/table/index.vue";
import Layer from "./layer.vue";
import { ElMessage } from "element-plus";
import type { LayerInterface } from "@/components/layer/index.vue";
import { radioData, selectData } from "@/views/main/pages/categoryTable/enum";
import { del } from "@/api/table";
import write from "@/utils/system/Clipboard";
import OriginUrlAddLayer from "@/views/main/pages/newsList/OriginUrlAddLayer.vue";
import NewsWordEditor from "@/views/main/pages/newsList/NewsWordEditor.vue";

export default defineComponent({
  name: "categoryTable",
  components: {
    Sort,
    OriginUrlAddLayer,
    newsTable,
    Table,
    Layer,
    NewsWordEditor,
  },
  setup() {
    const searchTitle = ref("");
    // const defaultLinkPrefix = ref("https://api.dianxiao.feedadx.com/dianxiao/jumpByLink/");
    let active: any = ref({});
    const currentNewsId = ref(0);
    provide("active", active);

    const searchDate = ref("");
    let idReverse = false; //false升序 true降序
    let createTimeReverse = false;
    const layer: LayerInterface = reactive({
      show: false,
      title: "新增文章",
      showButton: true,
    });

    const urlAddLayer: LayerInterface = reactive({
      show: false,
      title: "新增文章",
      showButton: true,
      confirmText: "生成",
    });
    const newsWordEditorLayer: LayerInterface = reactive({
      show: false,
      title: "新增文章",
      showButton: true,
      confirmText: "生成",
      width: "80%",
    });

    // const activeCategory: any = inject("active");
    const loading = ref(true);
    const tableData = ref([]);
    const chooseData = ref([]);
    const handleSelectionChange = (val: []) => {
      chooseData.value = val;
    };
    const page: Page = reactive({
      index: 1,
      size: 20,
      total: 0,
    });

    const getTableData = (init: boolean) => {
      let fromTime = searchDate.value[0];
      let endTime = searchDate.value[1];

      console.error("getTableData", init, fromTime, endTime);
      loading.value = true;
      let tempEndTime = endTime;
      if (tempEndTime != "") {
        let tempDate = new Date(tempEndTime);
        tempDate.setDate(tempDate.getDate() + 1);
        tempEndTime = formatTime(tempDate.getTime());
      }
      if (init) {
        page.index = 1;
      }
      let data = {
        fromTime,
        endTime: tempEndTime,
        page: page.index,
        size: page.size,
        title: "",
        idReverse,
        createTimeReverse,
      };
      if (searchTitle.value != null && searchTitle.value != "") {
        data.title = searchTitle.value;
      }

      getData({}, data)
        .then((res: any) => {
          res = res.data;
          let data = res.newsLinkMappers;
          data.forEach((d) => {
            const select = selectData.find(
              (select) => select.value === d.choose
            );
            select ? (d.chooseName = select.label) : (d.chooseName = d.choose);
            const radio = radioData.find((select) => select.value === d.radio);
            radio ? (d.radioName = radio.label) : d.radio;
            d.createTime = formatTime(d.createTime);
            d.updateTime = formatTime(d.updateTime);
          });
          tableData.value = res.newsLinkMappers;
          page.total = Number(res.total);
        })
        .catch((error) => {
          tableData.value = [];
          page.index = 1;
          page.total = 0;
        })
        .finally(() => {
          loading.value = false;
        });
    };

    const formatTime = (value: number) => {
      if (value) {
        let date = new Date(value); // 时间戳为秒：10位数
        //let date = new Date(value)    // 时间戳为毫秒：13位数
        let year = date.getFullYear();
        let month =
          date.getMonth() + 1 < 10
            ? `0${date.getMonth() + 1}`
            : date.getMonth() + 1;
        let day = date.getDate() < 10 ? `0${date.getDate()}` : date.getDate();
        let hour =
          date.getHours() < 10 ? `0${date.getHours()}` : date.getHours();
        let minute =
          date.getMinutes() < 10 ? `0${date.getMinutes()}` : date.getMinutes();
        let second =
          date.getSeconds() < 10 ? `0${date.getSeconds()}` : date.getSeconds();
        return `${year}-${month}-${day} ${hour}:${minute}:${second}`;
      } else {
        return "";
      }
    };
    const handleAdd = () => {
      layer.title = "新增数据";
      layer.show = true;
      delete layer.row;
    };
    const handleEdit = (row: object) => {
      currentNewsId.value = row.newsId;
      newsWordEditorLayer.type = 2;
      newsWordEditorLayer.title = "编辑数据";
      newsWordEditorLayer.row = row;
      newsWordEditorLayer.show = true;
    };

    const handleDel = (data: object[]) => {
      let params = {
        ids: data
          .map((e: any) => {
            return e.id;
          })
          .join(","),
      };
      del(params).then((res) => {
        ElMessage({
          type: "success",
          message: "删除成功",
        });
        getTableData(tableData.value.length === 1);
      });
    };
    const handleCopy = async (link: string) => {
      const copyRes: boolean = await write(link);
      if (copyRes) {
        ElMessage({
          type: "success",
          message: "复制成功",
        });
      } else {
        ElMessage({
          type: "error",
          message: "复制失败",
        });
      }
    };

    const handleUrlAdd = () => {
      urlAddLayer.title = "新增数据";
      urlAddLayer.show = true;
      delete urlAddLayer.row;
    };

    getTableData(false);

    const handleSearch = () => {
      getTableData(false);
    };
    const handleSort = (column: string) => {
      if (column == "id") {
        idReverse = !idReverse;
      } else if (column == "createTime") {
        createTimeReverse = !createTimeReverse;
      }
      getTableData(false);
      console.log("sort");
    };

    const handlerHtmlAdd = () => {
      newsWordEditorLayer.type = 1;
      newsWordEditorLayer.title = "新增数据";
      newsWordEditorLayer.show = true;
      delete newsWordEditorLayer.row;
      console.log("handlerHtmlAdd");
    };

    return {
      searchDate,
      Search,
      Plus,
      Sort,
      Delete,
      tableData,
      chooseData,
      loading,
      page,
      layer,
      handleSelectionChange,
      handleAdd,
      handleEdit,
      handleDel,
      getTableData,
      handleCopy,
      handleUrlAdd,
      urlAddLayer,
      searchTitle,
      handleSearch,
      handleSort,
      handlerHtmlAdd,
      newsWordEditorLayer,
      currentNewsId,
    };
  },
});
</script>

<style lang="scss" scoped>
.full {
  width: 100%;
  height: 100%;
  padding: 15px;
  box-sizing: border-box;

  .top {
    width: 100%;
    display: flex;
    flex-direction: row;
    align-items: center;
    margin: 0 0 0 10px;
    background-color: white;
    padding: 15px 0px 15px 15px;
  }

  .content {
    flex: 1;
    width: 100%;
    height: calc(100% - 100px);
    margin-top: 20px;
  }

  .selectCreateTime {
    display: flex;
    align-items: center;
  }
}
</style>
