<template>
  <div class="full">
    <div class="top">
      <div class="selectCreateTime">
        <el-text class="mx-1" type="primary" style="margin-right: 15px"
          >录入时间选择</el-text
        >
        <el-date-picker
          v-model="value1"
          type="daterange"
          range-separator="-"
          start-placeholder="开始时间"
          end-placeholder="结束时间"
          format="YYYY/MM/DD"
          value-format="YYYY-MM-DD"
          size="default"
          @change="dateSelectHandler"
        />
      </div>
      <div class="layout-container-form-search" style="margin-left: 20px">
        <el-input
          v-model="query.input"
          :placeholder="$t('message.common.searchTip')"
          @change="getTableData(true)"
        ></el-input>
        <el-button
          type="primary"
          :icon="Search"
          class="search-btn"
          @click="getTableData(true)"
          >{{ $t("message.common.search") }}</el-button
        >
      </div>
    </div>
    <div class="content">
      <my-table />
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, provide, reactive } from "vue";
import myTable from "@/views/main/pages/categoryTable/my-table.vue";
import { getData } from "@/api/news/news";
import { Page } from "@/components/table/type";
import { Search } from "@element-plus/icons";

export default defineComponent({
  name: "categoryTable",
  components: {
    myTable,
  },
  setup() {
    let active: any = ref({});
    provide("active", active);
    const value1 = ref("");
    const query = reactive({
      input: "",
    });
    const loading = ref(true);
    const tableData = ref([]);

    const page: Page = reactive({
      index: 1,
      size: 20,
      total: 0,
    });
    const dateSelectHandler = ([from, to]: Array<string>) => {
      console.error("select", from, to);
    };

    const getTableData = (init: boolean) => {
      loading.value = true;
      if (init) {
        page.index = 1;
      }
      let params = {
        page: page.index,
        pageSize: page.size,
        ...query,
      };

      getData(params, {})
        .then((res) => {
          tableData.value = res.data.list;
          page.total = Number(res.data.pager.total);
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
    return {
      value1,
      query,
      dateSelectHandler,
      getTableData,
      Search,
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
