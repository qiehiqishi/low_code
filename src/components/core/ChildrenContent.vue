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
</script>

<template>
  <ComponentRenderer
    v-for="child in component.children"
    :key="child.id"
    :component="child"
    :mode="mode"
    @select="handleChildSelect"
    @hover="handleChildHover"
  />
</template>
