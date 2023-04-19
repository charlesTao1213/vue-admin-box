<template>
    <newsList></newsList>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import newsList from "@/views/main/pages/newsList/index.vue";
export default defineComponent({
  components: {
    newsList
  },
});
</script>

<style lang="scss" scoped>
.box {
  padding: 15px;
}
</style>