<script setup lang="ts">
import { computed } from 'vue'
import { useEditorStore } from '@/store/editor'

const editorStore = useEditorStore()

// 选中的组件
const selectedComponent = computed(() => editorStore.selectedComponent)

// 选中的物料定义
const selectedMaterial = computed(() => {
  if (!selectedComponent.value) return null
  return editorStore.materials.find(m => m.type === selectedComponent.value?.type)
})

// 属性schema
const propSchema = computed(() => selectedMaterial.value?.schema || [])

// 更新属性
const handlePropChange = (propName: string, value: any) => {
  if (!selectedComponent.value) return
  editorStore.updateComponentProps(selectedComponent.value.id, {
    [propName]: value,
  })
}

// 删除组件
const handleDelete = () => {
  if (!selectedComponent.value) return
  editorStore.deleteComponent(selectedComponent.value.id)
}
</script>

<template>
  <div class="props-panel">
    <div class="props-panel__header">
      <h3 class="props-panel__title">属性配置</h3>
    </div>

    <div class="props-panel__content">
      <!-- 未选中组件时的提示 -->
      <div v-if="!selectedComponent" class="props-empty">
        <p class="props-empty__text">
          请在画布中选择一个组件进行配置
        </p>
      </div>

      <!-- 选中组件时的属性配置 -->
      <div v-else class="props-config">
        <!-- 组件信息 -->
        <div class="props-info">
          <div class="props-info__item">
            <span class="props-info__label">组件类型:</span>
            <span class="props-info__value">{{ selectedComponent.type }}</span>
          </div>
          <div class="props-info__item">
            <span class="props-info__label">组件名称:</span>
            <span class="props-info__value">{{ selectedComponent.label }}</span>
          </div>
        </div>

        <!-- 属性配置表单 -->
        <div class="props-form">
          <div 
            v-for="schema in propSchema"
            :key="schema.name"
            class="prop-item"
          >
            <label class="prop-item__label">{{ schema.label }}</label>

            <!-- 字符串类型 -->
            <el-input
              v-if="schema.type === 'string'"
              :model-value="selectedComponent.props[schema.name]"
              @update:model-value="handlePropChange(schema.name, $event)"
              :placeholder="`请输入${schema.label}`"
              size="small"
            />

            <!-- 数字类型 -->
            <el-input-number
              v-else-if="schema.type === 'number'"
              :model-value="selectedComponent.props[schema.name]"
              @update:model-value="handlePropChange(schema.name, $event)"
              size="small"
            />

            <!-- 布尔类型 -->
            <el-switch
              v-else-if="schema.type === 'boolean'"
              :model-value="selectedComponent.props[schema.name]"
              @update:model-value="handlePropChange(schema.name, $event)"
            />

            <!-- 选择类型 -->
            <el-select
              v-else-if="schema.type === 'select'"
              :model-value="selectedComponent.props[schema.name]"
              @update:model-value="handlePropChange(schema.name, $event)"
              size="small"
            >
              <el-option
                v-for="option in schema.options"
                :key="option.value"
                :label="option.label"
                :value="option.value"
              />
            </el-select>

            <!-- 颜色类型 -->
            <el-color-picker
              v-else-if="schema.type === 'color'"
              :model-value="selectedComponent.props[schema.name]"
              @update:model-value="handlePropChange(schema.name, $event)"
              size="small"
            />
          </div>
        </div>

        <!-- 操作按钮 -->
        <div class="props-actions">
          <el-button type="danger" size="small" @click="handleDelete">
            删除组件
          </el-button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.props-panel {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.props-panel__header {
  padding: 15px;
  border-bottom: 1px solid #e0e0e0;
}

.props-panel__title {
  font-size: 16px;
  font-weight: 600;
  color: #333;
  margin: 0;
}

.props-panel__content {
  flex: 1;
  overflow-y: auto;
  padding: 15px;
}

.props-empty {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 200px;
}

.props-empty__text {
  color: #999;
  font-size: 14px;
  text-align: center;
}

.props-config {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.props-info {
  background-color: #f5f5f5;
  padding: 10px;
  border-radius: 4px;
}

.props-info__item {
  display: flex;
  justify-content: space-between;
  margin-bottom: 5px;
}

.props-info__label {
  font-size: 12px;
  color: #666;
}

.props-info__value {
  font-size: 12px;
  color: #333;
  font-weight: 500;
}

.props-form {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.prop-item {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.prop-item__label {
  font-size: 12px;
  color: #666;
  font-weight: 500;
}

.props-actions {
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid #e0e0e0;
}
</style>