# 低代码平台拖拽功能使用指南

## 功能概述

低代码平台已实现完整的拖拽功能，支持从物料库拖拽组件到画布，并支持嵌套容器组件。

## 核心特性

### 1. 物料库拖拽
- **克隆模式**：拖拽物料时不会移动原物料，而是创建新的组件实例
- **分类展示**：物料按分类（基础组件、表单组件、容器组件）展示
- **容器标识**：容器组件有特殊标识，支持嵌套子组件

### 2. 画布接收拖拽
- **根容器接收**：画布根容器可以接收拖拽的组件
- **嵌套容器接收**：容器组件内部也可以接收拖拽，支持多层嵌套
- **实时渲染**：拖拽添加后立即渲染组件

### 3. 组件数据传递
- **默认 JSON 数据**：拖拽时传递的是组件的默认配置数据，不是组件本身
- **自动生成 ID**：每个新组件自动生成唯一 ID
- **样式分离**：组件属性和样式分开管理

## 使用方法

### 1. 添加组件到画布

**步骤：**
1. 在左侧物料库找到需要的组件
2. 拖拽组件到中间画布区域
3. 松开鼠标，组件自动添加到画布

**示例：**
```typescript
// 拖拽按钮组件到画布
// 自动生成以下数据结构：
{
  id: 'comp-1234567890-abc',
  componentName: 'el-button',
  label: '按钮',
  props: {
    type: 'primary',
    size: 'default',
  },
  styles: {
    width: 'auto',
    height: 'auto',
  },
  children: [],
  isContainer: false,
}
```

### 2. 添加组件到容器

**步骤：**
1. 先拖拽一个容器组件（如 `div` 或 `el-card`）到画布
2. 再拖拽其他组件到容器内部
3. 容器会自动接收并渲染子组件

**示例：**
```typescript
// 拖拽容器组件
{
  id: 'container-123',
  componentName: 'div',
  label: '容器',
  props: {},
  styles: {
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
  },
  children: [],  // 子组件数组
  isContainer: true,
}

// 拖拽输入框到容器内
{
  id: 'input-456',
  componentName: 'el-input',
  label: '输入框',
  props: {
    placeholder: '请输入内容',
  },
  styles: {
    width: '100%',
  },
  children: [],
  parentId: 'container-123',  // 父组件ID
}
```

### 3. 选中组件

**方法：**
- 点击画布中的组件即可选中
- 选中的组件会显示蓝色边框
- 右侧属性面板会显示选中组件的配置

### 4. 查看组件信息

**组件标签：**
- hover 或选中组件时，会显示组件名称标签
- 标签位于组件左上角

**组件数量：**
- 画布头部显示当前组件总数

## 技术实现

### 1. 物料克隆函数

在 [MaterialPanel.vue](file:///d:\web\my-app\low-code-electron\src\components\editor\MaterialPanel.vue#L31-42) 中：

```typescript
const cloneMaterial = (material: MaterialComponent): ComponentData => {
  console.log('克隆物料:', material.label)
  
  // 使用辅助函数生成组件数据
  const componentData = createComponentFromMaterial(material)
  
  console.log('生成组件数据:', componentData)
  
  return componentData
}
```

### 2. 拖拽添加处理

在 [Canvas.vue](file:///d:\web\my-app\low-code-electron\src\components\editor\Canvas.vue#L32-50) 中：

```typescript
const handleAddComponent = (event: any) => {
  console.log('拖拽添加组件:', event)
  
  // 获取拖拽的组件数据
  const componentData = event.item.__draggable_componentData
  
  if (componentData) {
    console.log('添加组件到画布:', componentData)
    
    // 添加到根容器
    editorStore.addComponent(componentData, 'root')
    
    // 选中新添加的组件
    editorStore.selectComponent(componentData)
  }
}
```

### 3. 容器内拖拽

在 [Canvas.vue](file:///d:\web\my-app\low-code-electron\src\components\editor\Canvas.vue#L67-79) 中：

```typescript
const handleContainerAdd = (containerId: string, event: any) => {
  console.log('容器内添加组件:', containerId, event)
  
  const componentData = event.item.__draggable_componentData
  
  if (componentData) {
    // 添加到指定容器
    editorStore.addComponent(componentData, containerId)
    
    // 选中新添加的组件
    editorStore.selectComponent(componentData)
  }
}
```

## VueDraggable 配置说明

### 物料区配置

```typescript
<VueDraggable
  :list="materialsByCategory[category]"
  :group="{ 
    name: 'materials', 
    pull: 'clone',  // 克隆模式（不移动原物料）
    put: false      // 不允许放入其他组件
  }"
  :sort="false"  // 禁止排序
  :clone="cloneMaterial"  // 克隆函数
  :animation="200"  // 动画时长
  ghost-class="material-item--ghost"
  chosen-class="material-item--chosen"
  drag-class="material-item--drag"
>
```

### 画布区配置

```typescript
<VueDraggable
  :list="rootChildren"
  group="materials"  // 与物料区相同的组名
  :animation="200"
  class="canvas__draggable"
  ghost-class="canvas__item--ghost"
  chosen-class="canvas__item--chosen"
  drag-class="canvas__item--drag"
  @add="handleAddComponent"  // 添加事件
  @end="handleDragEnd"  // 结束事件
>
```

## 可用物料组件

### 1. 基础组件
- **按钮 (el-button)**：支持类型、尺寸、朴素按钮等配置
- **输入框 (el-input)**：支持占位文本、尺寸、禁用状态等配置

### 2. 表单组件
- **输入框 (el-input)**：表单输入组件

### 3. 容器组件
- **容器 (div)**：原生 div 容器，支持 Flex 布局
- **卡片 (el-card)**：Element Plus 卡片组件

## 样式配置

### 物料项样式
- 默认：白色背景，灰色边框
- hover：蓝色背景，蓝色边框，上移 2px
- 拖拽：半透明，缩放 1.05

### 画布组件样式
- 默认：透明边框
- hover：灰色边框
- 选中：蓝色边框，蓝色阴影
- 容器：灰色背景，灰色边框

## 最佳实践

### 1. 组件命名
- 使用有意义的组件名称（如 "用户名输入框"）
- 容器组件建议添加描述性名称

### 2. 嵌套层级
- 建议最多嵌套 3 层容器
- 避免过度嵌套导致性能问题

### 3. 样式设置
- 先添加组件，再调整样式
- 使用右侧属性面板配置样式

### 4. 撤销/重做
- 每次拖拽操作都会保存历史
- 使用顶部工具栏的撤销/重做按钮

## 常见问题

### Q1: 拖拽后组件不显示？
**原因**：可能是 Renderer 组件渲染失败
**解决**：检查组件名称是否正确，查看控制台错误信息

### Q2: 容器无法接收拖拽？
**原因**：容器组件的 `isContainer` 属性为 false
**解决**：确保容器组件定义中 `isContainer: true`

### Q3: 拖拽时传递的是组件本身？
**原因**：clone 函数配置错误
**解决**：检查 `cloneMaterial` 函数是否正确生成组件数据

### Q4: 组件样式不生效？
**原因**：样式对象配置错误
**解决**：检查 `styles` 字段是否正确设置

## 扩展建议

### 1. 添加更多物料
在 [store/editor.ts](file:///d:\web\my-app\low-code-electron\src\store\editor.ts#L32-145) 的 `materials` 数组中添加新组件定义。

### 2. 自定义样式
修改 [MaterialPanel.vue](file:///d:\web\my-app\low-code-electron\src\components\editor\MaterialPanel.vue#L175-271) 和 [Canvas.vue](file:///d:\web\my-app\low-code-electron\src\components\editor\Canvas.vue#L258-447) 的样式。

### 3. 添加拖拽动画
调整 VueDraggable 的 `animation` 参数（建议 200-300ms）。

### 4. 实现拖拽预览
添加自定义拖拽预览图像。

## 相关文件

- [MaterialPanel.vue](file:///d:\web\my-app\low-code-electron\src\components\editor\MaterialPanel.vue) - 物料库组件
- [Canvas.vue](file:///d:\web\my-app\low-code-electron\src\components\editor\Canvas.vue) - 画布组件
- [Renderer.vue](file:///d:\web\my-app\low-code-electron\src\components\core\Renderer.vue) - 组件渲染器
- [editor.ts](file:///d:\web\my-app\low-code-electron\src\store\editor.ts) - 状态管理
- [componentUtils.ts](file:///d:\web\my-app\low-code-electron\src\utils\componentUtils.ts) - 组件工具函数

## 总结

拖拽功能已完全实现，支持：
- ✅ 物料库拖拽（克隆模式）
- ✅ 画布接收拖拽
- ✅ 嵌套容器拖拽
- ✅ 组件数据传递（默认 JSON）
- ✅ 实时渲染
- ✅ 选中/hover 状态
- ✅ 拖拽动画
- ✅ 撤销/重做支持

可以立即使用拖拽功能构建页面！