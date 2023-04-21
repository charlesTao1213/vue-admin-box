<template>
  <div class="layout-container">
    <div class="layout-container-form flex space-between">
      <div class="layout-container-form-handle">
        <el-button type="primary" :icon="Plus" @click="handleAdd">{{ $t("message.common.add") }}</el-button>
        <el-popconfirm :title="$t('message.common.delTip')" @confirm="handleDel(chooseData)">
          <template #reference>
            <el-button type="danger" :icon="Delete" :disabled="chooseData.length === 0">{{ $t("message.common.delBat")
              }}
            </el-button>
          </template>
        </el-popconfirm>
      </div>
    </div>
    <div class="layout-container-table">
      <Table
        ref="table"
        v-model:page="page"
        v-loading="loading"
        :showIndex="true"
        :showSelection="true"
        :data="tableData"
        @getTableData="getTableData"
        @selection-change="handleSelectionChange"
      >
        <el-table-column prop="id" label="id" align="center" />
        <el-table-column prop="newsId" label="newsId" align="center" />
        <el-table-column prop="textLink" label="链接" align="center" />
        <el-table-column prop="linkState" label="状态" align="center" />
        <el-table-column prop="createTime" label="创建时间" align="center" />
        <el-table-column prop="updateTime" label="更新时间" align="center" />
        <el-table-column :label="$t('message.common.handle')" align="center" fixed="right" width="200">
          <template #default="scope">
            <el-button @click="handleEdit(scope.row)">{{ $t("message.common.update") }}</el-button>
            <el-popconfirm :title="$t('message.common.delTip')" @confirm="handleDel([scope.row])">
              <template #reference>
                <el-button type="danger">{{ $t("message.common.del") }}</el-button>
              </template>
            </el-popconfirm>
          </template>
        </el-table-column>
      </Table>
      <Layer :layer="layer" @getTableData="getTableData" v-if="layer.show" />
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, reactive, inject, watch, defineExpose } from "vue";
import Table from "@/components/table/index.vue";
import { Page } from "@/components/table/type";
import { getData, del } from "@/api/table";
import Layer from "./layer.vue";
import { ElMessage } from "element-plus";
import type { LayerInterface } from "@/components/layer/index.vue";
import { selectData, radioData } from "./enum";
import { Plus, Search, Delete } from "@element-plus/icons";

export default defineComponent({
  components: {
    Table,
    Layer
  },
  setup() {
    // 存储搜索用的数据
    const query = reactive({
      input: ""
    });
    // 弹窗控制器
    const layer: LayerInterface = reactive({
      show: false,
      title: "新增",
      showButton: true
    });
    // 分页参数, 供table使用
    const page: Page = reactive({
      index: 1,
      size: 20,
      total: 0
    });
    const activeCategory: any = inject("active");
    const loading = ref(true);
    const tableData = ref([]);
    const chooseData = ref([]);
    const handleSelectionChange = (val: []) => {
      chooseData.value = val;
    };
    // 获取表格数据
    // params <init> Boolean ，默认为false，用于判断是否需要初始化分页
    const getTableData = (init: boolean) => {
      loading.value = true;
      if (init) {
        page.index = 1;
      }
      let params = {
        category: activeCategory.value.id,
        page: page.index,
        pageSize: page.size,
        ...query
      };
      getData(params)
        .then(res => {
          console.error(res)
          let data = res.data.list;
          if (Array.isArray(data)) {
            data.forEach(d => {
              const select = selectData.find(select => select.value === d.choose);
              select ? d.chooseName = select.label : d.chooseName = d.choose;
              const radio = radioData.find(select => select.value === d.radio);
              radio ? d.radioName = radio.label : d.radio;
              // d.createTime = formatTime(d.createTime);
              // d.updateTime = formatTime(d.updateTime);

            });
          }

          tableData.value = res.data.list;

          page.total = Number(res.data.pager.total);
        })
        .catch(error => {
          console.error(error)
          tableData.value = [];
          page.index = 1;
          page.total = 0;
        })
        .finally(() => {
          loading.value = false;
        });
    };
    // 删除功能
    // const formatTime = (value: number) => {
    //   if (value) {
    //     let date = new Date(value * 1000); // 时间戳为秒：10位数
    //     //let date = new Date(value)    // 时间戳为毫秒：13位数
    //     let year = date.getFullYear();
    //     let month = date.getMonth() + 1 < 10 ? `0${date.getMonth() + 1}` : date.getMonth() + 1;
    //     let day = date.getDate() < 10 ? `0${date.getDate()}` : date.getDate();
    //     let hour = date.getHours() < 10 ? `0${date.getHours()}` : date.getHours();
    //     let minute = date.getMinutes() < 10 ? `0${date.getMinutes()}` : date.getMinutes();
    //     let second = date.getSeconds() < 10 ? `0${date.getSeconds()}` : date.getSeconds();
    //     return `${year}-${month}-${day} ${hour}:${minute}:${second}`;
    //   } else {
    //     return "";
    //   }
    // };
    const handleDel = (data: object[]) => {
      let params = {
        ids: data.map((e: any) => {
          return e.id;
        }).join(",")
      };
      del(params)
        .then(res => {
          ElMessage({
            type: "success",
            message: "删除成功"
          });
          getTableData(tableData.value.length === 1 ? true : false);
        });
    };
    // 新增弹窗功能
    const handleAdd = () => {
      layer.title = "新增数据";
      layer.show = true;
      delete layer.row;
    };
    // 编辑弹窗功能
    const handleEdit = (row: object) => {
      layer.title = "编辑数据";
      layer.row = row;
      layer.show = true;
    };
    watch(activeCategory, (newVal) => {
      getTableData(true);
    });
    defineExpose({
      getTableData
    });
    // getTableData(true)
    return {
      Plus,
      Search,
      Delete,
      query,
      tableData,
      chooseData,
      loading,
      page,
      layer,
      handleSelectionChange,
      handleAdd,
      handleEdit,
      handleDel,
      getTableData
    };
  }
});
</script>

<style lang="scss" scoped>
.layout-container {
  width: calc(100% - 10px);
  height: 100%;
  margin: 0 0 0 10px;
}
</style>