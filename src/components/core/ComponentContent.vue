<script setup lang="ts">
import { computed } from 'vue';
import type { ComponentData } from '@/types/editor';
import ChildrenContent from './ChildrenContent.vue';
import AlertContent from './AlertContent.vue';
import SelectContent from './SelectContent.vue';
import StepsContent from './StepsContent.vue';
import TableContent from './TableContent.vue';
import BreadcrumbContent from './BreadcrumbContent.vue';
import TabsContent from './TabsContent.vue';

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

const hasChildren = computed(() => {
  return props.component.children && props.component.children.length > 0;
});

const contentComponent = computed(() => {
  const name = props.component.componentName;
  if (hasChildren.value) {
    if (name === 'el-tabs') return TabsContent;
    return ChildrenContent;
  }
  
  const componentMap: Record<string, any> = {
    'el-alert': AlertContent,
    'el-select': SelectContent,
    'el-steps': StepsContent,
    'el-table': TableContent,
    'el-breadcrumb': BreadcrumbContent,
    'el-tabs': TabsContent,
  };
  
  return componentMap[name] || null;
});

const textContent = computed(() => {
  const name = props.component.componentName;
  if (name === 'el-button') return props.component.props.text || '按钮';
  if (name === 'el-text') return props.component.props.content || '文本内容';
  if (name === 'el-tag') return props.component.props.content || '标签';
  return '';
});

const hasTextContent = computed(() => {
  const name = props.component.componentName;
  return ['el-button', 'el-text', 'el-tag'].includes(name);
});

const handleChildSelect = (id: string) => {
  emit('select', id);
};

const handleChildHover = (id: string | null) => {
  emit('hover', id);
};
</script>

<template>
  <component
    v-if="contentComponent"
    :is="contentComponent"
    :component="component"
    :mode="mode"
    @select="handleChildSelect"
    @hover="handleChildHover"
  />
  
  <span v-else-if="hasTextContent">{{ textContent }}</span>
</template>
