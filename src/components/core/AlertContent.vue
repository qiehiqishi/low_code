<script setup lang="ts">
import type { ComponentData } from '@/types/editor';

interface Props {
  component: ComponentData;
}

const props = defineProps<Props>();
</script>

<template>
  <span>{{ component.props.description || '' }}</span>
</template>
