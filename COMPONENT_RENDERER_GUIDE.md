# ComponentRenderer 递归渲染器使用指南

## 概述

ComponentRenderer 是一个递归渲染器组件，用于将 Store 中的 JSON 数据结构渲染成真实的 Vue 页面。支持设计态和预览态两种模式。

## 核心特性

### 1. 动态组件渲染
- 使用 `<component :is>` 动态渲染 Element Plus 组件
- 支持原生 HTML 元素（div、span、p）
- 自动转换组件名称（el-button → ElButton）

### 2. 递归渲染
- 支持嵌套容器组件
- 自动递归渲染子组件
- 无限层级嵌套支持

### 3. 设计态包装
- hover 时显示蓝色边框
- 点击触发选中事件
- 显示组件标签
- 容器空状态提示

### 4. 双模式支持
- **设计态**：带包装层，支持交互
- **预览态**：纯净渲染，无包装层

## Props 定义

```typescript
interface Props {
  component: ComponentData  // 组件数据（必填）
  mode?: 'design' | 'preview'  // 渲染模式（可选，默认 design）
}
```

### component 参数

```typescript
interface ComponentData {
  id: string                  // 组件唯一标识
  componentName: string       // 组件名称（如 'el-button', 'div'）
  label?: string              // 显示名称
  props: ComponentProps       // 组件属性
  styles: ComponentStyles     // 组件样式
  children?: ComponentData[]  // 子组件数组
  isContainer?: boolean       // 是否为容器
  // ... 其他属性
}
```

### mode 参数

- `design`：设计态，带包装层和交互功能
- `preview`：预览态，纯净渲染

## Events 定义

```typescript
interface Emits {
  select: [id: string]        // 选中事件
  hover: [id: string | null]  // hover 事件
}
```

## 使用示例

### 1. 基础使用（设计态）

```vue
<template>
  <ComponentRenderer
    :component="componentData"
    mode="design"
    @select="handleSelect"
    @hover="handleHover"
  />
</template>

<script setup lang="ts">
import ComponentRenderer from '@/components/core/ComponentRenderer.vue'
import type { ComponentData } from '@/types/editor'

const componentData: ComponentData = {
  id: 'button-1',
  componentName: 'el-button',
  label: '提交按钮',
  props: {
    type: 'primary',
    size: 'default',
  },
  styles: {
    width: 'auto',
    height: 'auto',
  },
  children: [],
}

const handleSelect = (id: string) => {
  console.log('选中组件:', id)
}

const handleHover = (id: string | null) => {
  console.log('hover 组件:', id)
}
</script>
```

### 2. 嵌套容器渲染

```vue
<template>
  <ComponentRenderer
    :component="containerData"
    mode="design"
    @select="handleSelect"
    @hover="handleHover"
  />
</template>

<script setup lang="ts">
const containerData: ComponentData = {
  id: 'container-1',
  componentName: 'div',
  label: '表单容器',
  props: {},
  styles: {
    width: '100%',
    padding: '20px',
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
  },
  children: [
    {
      id: 'input-1',
      componentName: 'el-input',
      label: '用户名',
      props: {
        placeholder: '请输入用户名',
      },
      styles: {
        width: '100%',
      },
      children: [],
    },
    {
      id: 'button-1',
      componentName: 'el-button',
      label: '提交',
      props: {
        type: 'primary',
      },
      styles: {},
      children: [],
    },
  ],
  isContainer: true,
}
</script>
```

### 3. 预览态使用

```vue
<template>
  <ComponentRenderer
    :component="pageData"
    mode="preview"
  />
</template>

<script setup lang="ts">
// 预览态不需要监听事件
const pageData: ComponentData = {
  // ... 页面数据
}
</script>
```

### 4. 在画布中使用

```vue
<template>
  <div class="canvas">
    <ComponentRenderer
      v-for="component in components"
      :key="component.id"
      :component="component"
      mode="design"
      @select="handleSelect"
      @hover="handleHover"
    />
  </div>
</template>

<script setup lang="ts">
import { useEditorStore } from '@/store/editor'
import ComponentRenderer from '@/components/core/ComponentRenderer.vue'

const editorStore = useEditorStore()

// 从 store 获取组件列表
const components = computed(() => editorStore.components[0]?.children || [])

const handleSelect = (id: string) => {
  const component = editorStore.findComponentById(id)
  editorStore.selectComponent(component)
}

const handleHover = (id: string | null) => {
  if (id) {
    const component = editorStore.findComponentById(id)
    editorStore.hoverComponent(component)
  } else {
    editorStore.hoverComponent(null)
  }
}
</script>
```

## 组件名称转换规则

### Element Plus 组件

| componentName | 转换后 | Element Plus 组件 |
|---------------|--------|-------------------|
| el-button | ElButton | ElButton |
| el-input | ElInput | ElInput |
| el-card | ElCard | ElCard |
| el-form | ElForm | ElForm |
| el-form-item | ElFormItem | ElFormItem |

### 原生 HTML 元素

| componentName | 渲染为 |
|---------------|--------|
| div | `<div>` |
| span | `<span>` |
| p | `<p>` |

## 设计态特性

### 1. 包装层样式

```css
.component-renderer-wrapper {
  position: relative;
  border: 1px solid transparent;
  border-radius: 4px;
  transition: all 0.2s ease;
  cursor: pointer;
  min-height: 20px;
}

/* hover 状态 */
.component-renderer-wrapper:hover {
  border-color: #c0c4cc;
}

/* hover 蓝色边框 */
.component-renderer-wrapper--hovered {
  border: 2px solid #409eff;
  background-color: rgba(64, 158, 255, 0.02);
}

/* 选中状态 */
.component-renderer-wrapper--selected {
  border: 2px solid #409eff;
  background-color: rgba(64, 158, 255, 0.05);
  box-shadow: 0 0 0 2px rgba(64, 158, 255, 0.2);
}
```

### 2. 组件标签

- hover 或选中时显示
- 位于组件左上角
- 显示组件名称或 label

### 3. 容器空状态

- 容器无子组件时显示提示
- 提示文本："拖拽组件到容器内"

### 4. 选中/hover 指示器

- 选中：蓝色实线边框 + 半透明背景
- hover：蓝色虚线边框 + 半透明背景

## 预览态特性

### 1. 纯净渲染

- 无包装层
- 无交互事件
- 无视觉指示器

### 2. 样式继承

- 组件样式完整保留
- 支持所有 CSS 属性

## 递归渲染原理

### 1. 组件识别

```typescript
// 计算动态组件
const dynamicComponent = computed(() => {
  const componentName = props.component.componentName
  
  // Element Plus 组件
  if (componentName.startsWith('el-')) {
    const convertedName = componentName
      .replace('el-', '')
      .split('-')
      .map(s => s.charAt(0).toUpperCase() + s.slice(1))
      .join('')
    
    return ElementPlusComponents[`El${convertedName}`]
  }
  
  // 原生 HTML 元素
  if (componentName === 'div' || componentName === 'span' || componentName === 'p') {
    return componentName
  }
  
  return null
})
```

### 2. 属性绑定

```typescript
// 计算组件属性（合并 props 和 styles）
const componentAttrs = computed(() => {
  return {
    ...props.component.props,  // 组件属性
    style: props.component.styles,  // 组件样式
  }
})
```

### 3. 递归调用

```vue
<template>
  <component
    :is="dynamicComponent"
    v-bind="componentAttrs"
  >
    <!-- 递归渲染子组件 -->
    <template v-if="hasChildren">
      <ComponentRenderer
        v-for="child in component.children"
        :key="child.id"
        :component="child"
        :mode="mode"
        @select="handleChildSelect"
        @hover="handleChildHover"
      />
    </template>
  </component>
</template>
```

## 事件传递机制

### 1. 事件冒泡阻止

```typescript
const handleSelect = (event: Event) => {
  event.stopPropagation()  // 阻止事件冒泡
  
  if (props.mode === 'design') {
    emit('select', props.component.id)
    editorStore.selectComponent(props.component)
  }
}
```

### 2. 子组件事件传递

```typescript
// 处理子组件选中事件（递归传递）
const handleChildSelect = (id: string) => {
  emit('select', id)  // 向上层传递
}

// 处理子组件 hover 事件（递归传递）
const handleChildHover = (id: string | null) => {
  emit('hover', id)  // 向上层传递
}
```

## 完整示例：页面渲染

```vue
<template>
  <div class="page-editor">
    <!-- 画布区域 -->
    <div class="canvas-area">
      <ComponentRenderer
        v-if="rootComponent"
        :component="rootComponent"
        mode="design"
        @select="handleSelect"
        @hover="handleHover"
      />
    </div>
    
    <!-- 属性面板 -->
    <div class="props-panel">
      <PropsEditor
        v-if="selectedComponent"
        :component="selectedComponent"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useEditorStore } from '@/store/editor'
import ComponentRenderer from '@/components/core/ComponentRenderer.vue'
import PropsEditor from '@/components/editor/PropsEditor.vue'

const editorStore = useEditorStore()

// 根组件
const rootComponent = computed(() => editorStore.components[0])

// 选中的组件
const selectedComponent = computed(() => editorStore.selectedComponent)

// 处理选中
const handleSelect = (id: string) => {
  const component = editorStore.findComponentById(id)
  editorStore.selectComponent(component)
}

// 处理 hover
const handleHover = (id: string | null) => {
  if (id) {
    const component = editorStore.findComponentById(id)
    editorStore.hoverComponent(component)
  } else {
    editorStore.hoverComponent(null)
  }
}
</script>
```

## 最佳实践

### 1. 性能优化

- 使用 `computed` 计算动态组件
- 使用 `:key` 确保组件唯一性
- 避免深层嵌套（建议最多 3 层）

### 2. 样式管理

- 使用 `styles` 对象管理样式
- 避免在 `props` 中传递样式
- 使用 CSS 变量实现主题切换

### 3. 事件处理

- 使用 `event.stopPropagation()` 阻止冒泡
- 递归传递事件到顶层
- 在顶层统一处理选中逻辑

### 4. 容器判断

- 使用 `isContainer` 字段标识容器
- 自动识别 div 和 el-card 为容器
- 容器空状态提供友好提示

## 常见问题

### Q1: 组件不显示？

**原因**：组件名称转换失败
**解决**：检查 componentName 是否正确，查看控制台错误

### Q2: 子组件不渲染？

**原因**：children 数组为空或未传递
**解决**：确保 children 数组正确初始化

### Q3: 样式不生效？

**原因**：styles 对象配置错误
**解决**：检查 styles 字段是否正确设置

### Q4: 事件不触发？

**原因**：mode 设置为 preview
**解决**：确保 mode 为 'design'

### Q5: 递归渲染卡顿？

**原因**：嵌套层级过深
**解决**：减少嵌套层级，优化组件结构

## 相关文件

- [ComponentRenderer.vue](file:///d:\web\my-app\low-code-electron\src\components\core\ComponentRenderer.vue) - 递归渲染器
- [editor.ts](file:///d:\web\my-app\low-code-electron\src\types\editor.ts) - 类型定义
- [editor.ts](file:///d:\web\my-app\low-code-electron\src\store\editor.ts) - 状态管理
- [Canvas.vue](file:///d:\web\my-app\low-code-electron\src\components\editor\Canvas.vue) - 画布组件

## 总结

ComponentRenderer 是一个功能完整的递归渲染器，支持：

- ✅ 动态组件渲染（`<component :is>`）
- ✅ 属性绑定（`v-bind="component.props"`）
- ✅ 递归渲染子组件
- ✅ 设计态包装层
- ✅ hover 蓝色边框
- ✅ 点击选中事件
- ✅ 双模式支持（design/preview）
- ✅ 容器空状态提示
- ✅ 组件标签显示
- ✅ 事件递归传递

可以立即用于低代码平台的页面渲染！