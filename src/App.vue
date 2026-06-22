<script setup lang="ts">
import { ref } from 'vue'
import Editor from '@/components/editor/Editor.vue'

const projectName = ref<string>('低代码平台')
</script>

<template>
  <div class="app">
    <Editor />
  </div>
</template>

<style scoped>
.app {
  width: 100%;
  height: 100vh;
}
</style>