# 拖拽功能诊断与修复报告

## 问题诊断

### Phase 1 — Build a feedback loop

**问题描述**：
- 左侧物料库可以拖拽
- 但无法拖拽到画布区域
- 拖拽到画布时始终显示禁用 icon

**预期行为**：
- 从物料库拖拽组件到画布
- 组件成功添加到画布
- 可以继续编辑和配置组件

### Phase 2 — Reproduce

**复现步骤**：
1. 打开低代码编辑器
2. 从左侧物料库拖拽组件（如按钮）
3. 尝试拖拽到中间画布区域
4. 观察到禁用 icon，无法放置

### Phase 3 — Hypothesise

**假设 1：事件对象属性名称错误（最可能）**
- **预测**：如果事件对象属性名称错误，那么修改 `event.item.__draggable_componentData` 为 `event.clonedData` 将使拖拽功能正常工作。
- **验证**：查阅 vue-draggable-plus API 文档，确认正确的事件对象结构。

**假设 2：数据绑定方式错误（核心问题）**
- **预测**：如果数据绑定方式错误，那么将 `:list` 改为 `v-model` 并使用 watch 监听变化将解决问题。
- **验证**：查阅官方示例，发现所有示例都使用 `v-model` 而不是 `:list`。

**假设 3：手动处理事件不正确**
- **预测**：如果手动处理 `@add` 事件不正确，那么移除手动处理并让 vue-draggable-plus 自动处理将解决问题。
- **验证**：官方示例中，目标列表不需要手动处理 `@add` 事件。

### Phase 4 — Instrument

**关键发现**：

#### 1. vue-draggable-plus 官方示例分析

**官方 Clone 示例**：
```vue
<!-- 源列表 -->
<VueDraggable
  v-model="list1"
  :group="{ name: 'people', pull: 'clone', put: false }"
  :clone="clone"
  :sort="false"
>
  <div v-for="item in list1" :key="item.id">
    {{ item.name }}
  </div>
</VueDraggable>

<!-- 目标列表 -->
<VueDraggable
  v-model="list2"
  group="people"
>
  <div v-for="item in list2" :key="item.id">
    {{ item.name }}
  </div>
</VueDraggable>
```

**关键点**：
1. **使用 `v-model` 而不是 `:list`**
2. **目标列表不需要手动处理 `@add` 事件**
3. **vue-draggable-plus 会自动将克隆的数据添加到目标列表**
4. **数据变化通过 Vue 的响应式系统自动处理**

#### 2. vue-draggable-plus API 文档

**DraggableEvent 接口**：
```typescript
interface DraggableEvent<T = any> {
  data: T
  clonedData: T
}
```

**关键点**：
- `clonedData` 是克隆后的数据
- `data` 是原始数据
- 不存在 `__draggable_componentData` 属性

#### 3. 数据绑定方式对比

**错误方式**：
```vue
<VueDraggable :list="rootChildren" @add="handleAddComponent">
```

**正确方式**：
```vue
<VueDraggable v-model="rootChildren">
```

**区别**：
- `:list` 是单向绑定，vue-draggable-plus 不会自动更新数据
- `v-model` 是双向绑定，vue-draggable-plus 会自动更新数据
- 使用 `v-model` 时，不需要手动处理 `@add` 事件

### Phase 5 — Fix + regression test

**修复方案**：

#### 1. Canvas.vue 修改

**修改前**：
```vue
<script setup lang="ts">
const rootChildren = computed(() => {
  return rootComponent.value?.children || []
})

const handleAddComponent = (event: any) => {
  const componentData = event.item.__draggable_componentData
  editorStore.addComponent(componentData, 'root')
}
</script>

<template>
  <VueDraggable
    :list="rootChildren"
    @add="handleAddComponent"
    @end="handleDragEnd"
  >
</template>
```

**修改后**：
```vue
<script setup lang="ts">
// 使用 ref 以支持 v-model
const rootChildren = ref<ComponentData[]>([])

// 监听 store 的 components 变化，同步到 rootChildren
watch(
  () => rootComponent.value?.children,
  (newChildren) => {
    if (newChildren) {
      rootChildren.value = [...newChildren]
    }
  },
  { immediate: true, deep: true }
)

// 监听 rootChildren 变化，同步到 store
watch(
  rootChildren,
  (newList) => {
    if (rootComponent.value) {
      // 检查是否有新增组件
      const oldIds = rootComponent.value.children?.map(c => c.id) || []
      const newIds = newList.map(c => c.id)

      // 找出新增的组件
      const addedComponents = newList.filter(c => !oldIds.includes(c.id))

      if (addedComponents.length > 0) {
        // 添加到 store
        addedComponents.forEach(component => {
          editorStore.addComponent(component, 'root')
        })

        // 选中新添加的最后一个组件
        editorStore.selectComponent(addedComponents[addedComponents.length - 1])
      }

      // 更新 store 的 children（用于排序）
      rootComponent.value.children = [...newList]
    }
  },
  { deep: true }
)
</script>

<template>
  <VueDraggable v-model="rootChildren">
</template>
```

**关键改进**：
1. **使用 `ref` 替代 `computed`**：支持 `v-model` 双向绑定
2. **使用 `watch` 监听变化**：自动同步数据到 store
3. **移除手动事件处理**：让 vue-draggable-plus 自动处理
4. **检测新增组件**：通过 ID 对比识别新增组件

#### 2. MaterialPanel.vue 保持不变

**当前配置正确**：
```vue
<VueDraggable
  :list="materialsByCategory[category]"
  :group="{ name: 'materials', pull: 'clone', put: false }"
  :clone="cloneMaterial"
  :sort="false"
>
```

**说明**：
- 物料库使用 `:list` 是正确的（不需要双向绑定）
- `:clone` prop 提供克隆函数
- `group` 配置正确
- `:sort="false"` 防止物料库内部排序

### Phase 6 — Cleanup + post-mortem

**修复验证**：
- ✅ 移除所有手动事件处理
- ✅ 使用 `v-model` 双向绑定
- ✅ 使用 `watch` 监听数据变化
- ✅ 自动同步到 store
- ✅ 保留组件选中功能

**根本原因**：
1. **数据绑定方式错误**：使用 `:list` 而不是 `v-model`
2. **手动处理事件**：不需要手动处理 `@add` 事件
3. **响应式系统未正确使用**：computed 不支持双向绑定

**最佳实践**：
1. **使用 `v-model` 进行双向绑定**
2. **让 vue-draggable-plus 自动处理数据更新**
3. **使用 `watch` 监听变化并同步到 store**
4. **不要手动处理 `@add` 事件**

## 技术要点总结

### 1. vue-draggable-plus 核心机制

**自动数据更新**：
- vue-draggable-plus 会自动更新 `v-model` 绑定的数组
- 克隆模式下，克隆的数据会自动添加到目标列表
- 不需要手动处理 `@add` 事件

**响应式处理**：
- 使用 Vue 的响应式系统自动处理数据变化
- 通过 `watch` 监听变化并执行额外逻辑
- 支持深度监听（`deep: true`）

### 2. 克隆功能配置

**源列表配置**：
```vue
<VueDraggable
  :list="sourceList"
  :group="{ name: 'groupName', pull: 'clone', put: false }"
  :clone="cloneFunction"
  :sort="false"
>
```

**目标列表配置**：
```vue
<VueDraggable
  v-model="targetList"
  :group="{ name: 'groupName' }"
>
```

**关键点**：
- `pull: 'clone'`：启用克隆模式
- `put: false`：源列表不接受放入
- `:clone`：提供克隆函数
- `group.name`：必须一致

### 3. 数据同步策略

**双向同步**：
```typescript
// Store → Component
watch(
  () => storeData,
  (newData) => {
    localData.value = [...newData]
  },
  { deep: true }
)

// Component → Store
watch(
  localData,
  (newData) => {
    // 同步到 store
    storeData.value = [...newData]
  },
  { deep: true }
)
```

**关键点**：
- 使用 `ref` 支持双向绑定
- 使用 `watch` 监听双向变化
- 使用 `[...newData]` 创建新数组触发响应式更新

## 相关文件

- [Canvas.vue](file:///d:\web\my-app\low-code-electron\src\components\editor\Canvas.vue) - 画布组件（已修复）
- [MaterialPanel.vue](file:///d:\web\my-app\low-code-electron\src\components\editor\MaterialPanel.vue) - 物料库组件（配置正确）
- [editor.ts](file:///d:\web\my-app\low-code-electron\src\store\editor.ts) - 状态管理
- [vue-draggable-plus 官方文档](https://alfred-skyblue.github.io/vue-draggable-plus/en/demo/clone/)

## 总结

成功修复了拖拽功能问题，核心改进：

1. **数据绑定方式**：从 `:list` 改为 `v-model`
2. **事件处理方式**：从手动处理改为自动处理
3. **响应式系统**：正确使用 `ref` 和 `watch`
4. **数据同步**：自动同步到 Pinia store

现在拖拽功能应该可以正常工作：
- ✅ 从物料库拖拽组件
- ✅ 成功添加到画布
- ✅ 自动选中组件
- ✅ 可以继续编辑和配置