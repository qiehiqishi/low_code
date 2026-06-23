<script setup lang="ts">
import type { ComponentData } from '@/types/editor';
import ComponentRenderer from './ComponentRenderer.vue';

interface Props {
  component: ComponentData;
  mode?: 'design' | 'preview';
}

const props = withDefaults(defineProps<Props>(), {
  mode: 'design',
});

const emit = defineEmits<{
  select: [id: string];
  hover: [id: string | null];
}>();

const handleChildSelect = (id: string) => {
  emit('select', id);
};

const handleChildHover = (id: string | null) => {
  emit('hover', id);
};

const hasChildren = () => {
  return props.component.children && props.component.children.length > 0;
};
</script>

<template>
  <el-tab-pane label="标签1" name="1">
    <div v-if="!hasChildren()" class="component-renderer__empty">
      <span class="component-renderer__empty-text">拖拽组件到标签页内</span>
    </div>
    <ComponentRenderer
      v-for="child in component.children"
      :key="child.id"
      :component="child"
      :mode="mode"
      @select="handleChildSelect"
      @hover="handleChildHover"
    />
  </el-tab-pane>
</template>
