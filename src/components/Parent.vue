<template>
  <div>
    <button>父组件</button>
    <Child :execute-action="triggerAction" />
  </div>
</template>

<script setup>
import { ref } from "vue";
import Child from "@/components/Child.vue";
const changeParent = () => {};
const triggerAction = () => {};
</script>

<style lang="less" scoped></style>
