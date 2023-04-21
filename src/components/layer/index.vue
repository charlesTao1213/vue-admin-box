<template>
  <div v-drag="layer.show">
    <el-dialog
      v-model="layer.show"
      :title="layer.title"
      :width="layer.width"
      center
    >
      <slot></slot>
      <template #footer v-if="layer.showButton">
        <div>
          <el-button type="primary" @click="confirm">{{ confirmText }}</el-button>
          <el-button @click="close">{{ closeText }}</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref } from "vue";
import drag from "@/directive/drag/index";

export interface LayerInterface {
  show: boolean;
  title: string;
  showButton?: boolean;
  width?: string;

  [propName: string]: any;

  confirmText?: string;
  closeText?: string;
}

export interface LayerType {
  close: Function;
}


export default defineComponent({
  props: {
    layer: {
      type: Object,
      default: () => {
        return {
          show: false,
          title: "",
          showButton: false

        };
      },
      required: true
    }
  },
  directives: {
    drag
  },
  setup(props, ctx) {
    console.log(props.layer.closeText);
    if (props.layer.closeText == undefined || props.layer.closeText == "") {
      props.layer.closeText = "取消";
    }
    if (props.layer.confirmText == undefined || props.layer.confirmText == "") {
      props.layer.confirmText = "确认";
    }

    function confirm() {
      ctx.emit("confirm");
    }

    function close() {
      props.layer.show = false;
    }

    return {
      confirm,
      close,
      confirmText: props.layer.confirmText,
      closeText: props.layer.closeText
    };
  }
});
</script>

<style lang="scss" scoped>

</style>