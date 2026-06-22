# 低代码平台核心数据结构使用指南

## 数据结构说明

### ComponentData（核心组件数据）

```typescript
interface ComponentData {
  id: string                  // 组件唯一标识（UUID）
  componentName: string       // 组件名称（如 'el-button', 'el-input', 'div'）
  label?: string              // 组件显示名称（可选，用于编辑器展示）
  props: ComponentProps       // 组件属性对象（如按钮的 type、size）
  styles: ComponentStyles     // 组件样式对象
  children?: ComponentData[]  // 子组件数组（递归，支持嵌套容器）
  parentId?: string           // 父组件ID（可选，用于快速定位父级）
  slotName?: string           // 插槽名称（可选，用于 Vue 插槽）
  isContainer?: boolean       // 是否为容器组件（可选，用于编辑器判断）
  isLocked?: boolean          // 是否锁定（可选，防止误操作）
  isVisible?: boolean         // 是否可见（可选，控制显示隐藏）
  events?: Record<string, string>  // 事件绑定（可选）
  animations?: AnimationConfig[]   // 动画配置（可选）
  conditions?: ConditionConfig[]   // 条件渲染配置（可选）
}
```

### ComponentStyles（组件样式）

```typescript
interface ComponentStyles {
  width?: string              // 宽度
  height?: string             // 高度
  padding?: string            // 内边距
  margin?: string             // 外边距
  backgroundColor?: string    // 背景色
  color?: string              // 文字颜色
  fontSize?: string           // 字体大小
  fontWeight?: string         // 字体粗细
  textAlign?: 'left' | 'center' | 'right'  // 文本对齐
  border?: string             // 边框
  borderRadius?: string       // 圆角
  display?: 'block' | 'inline' | 'flex' | 'grid'  // 显示方式
  flexDirection?: 'row' | 'column'  // Flex 方向
  justifyContent?: string     // Flex 主轴对齐
  alignItems?: string         // Flex 交叉轴对齐
  gap?: string                // Flex/Grid 间距
  position?: 'static' | 'relative' | 'absolute' | 'fixed'  // 定位方式
  zIndex?: number             // 层级
  opacity?: number            // 透明度
  boxShadow?: string          // 阴影
  overflow?: 'visible' | 'hidden' | 'auto' | 'scroll'  // 溢出处理
  cursor?: string             // 鼠标样式
  [key: string]: any          // 其他样式属性
}
```

## Pinia Store 使用示例

### 1. 初始化组件树

```typescript
import { useEditorStore } from '@/store/editor'

const editorStore = useEditorStore()

// 初始化组件树（创建根容器）
editorStore.initComponents()
```

### 2. 添加组件

```typescript
// 创建一个按钮组件
const buttonComponent: ComponentData = {
  id: `button-${Date.now()}`,
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
}

// 添加到根容器
editorStore.addComponent(buttonComponent, 'root')

// 创建一个容器组件
const containerComponent: ComponentData = {
  id: `container-${Date.now()}`,
  componentName: 'div',
  label: '容器',
  props: {},
  styles: {
    width: '100%',
    height: '200px',
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
  },
  children: [],
  isContainer: true,
}

// 添加容器到根容器
editorStore.addComponent(containerComponent, 'root')

// 创建输入框组件并添加到容器中
const inputComponent: ComponentData = {
  id: `input-${Date.now()}`,
  componentName: 'el-input',
  label: '输入框',
  props: {
    placeholder: '请输入内容',
    size: 'default',
  },
  styles: {
    width: '100%',
    height: 'auto',
  },
  children: [],
}

// 添加输入框到容器组件中
editorStore.addComponent(inputComponent, containerComponent.id)
```

### 3. 更新组件属性

```typescript
// 更新按钮的属性
editorStore.updateComponentProps('button-123', {
  type: 'success',
  size: 'large',
  loading: true,
})
```

### 4. 更新组件样式

```typescript
// 更新容器的样式
editorStore.updateComponentStyles('container-123', {
  backgroundColor: '#f5f5f5',
  padding: '20px',
  borderRadius: '8px',
})
```

### 5. 删除组件

```typescript
// 删除指定组件
editorStore.deleteComponent('button-123')
```

### 6. 查找组件

```typescript
// 根据 ID 查找组件
const component = editorStore.findComponentById('button-123')

if (component) {
  console.log('找到组件:', component.label)
  console.log('组件属性:', component.props)
  console.log('组件样式:', component.styles)
}
```

### 7. 选中组件

```typescript
// 选中组件
editorStore.selectComponent(component)

// 清空选中状态
editorStore.selectComponent(null)
```

### 8. 撤销/重做

```typescript
// 撤销操作
if (editorStore.canUndo) {
  editorStore.undo()
}

// 重做操作
if (editorStore.canRedo) {
  editorStore.redo()
}
```

### 9. 获取所有组件

```typescript
// 获取扁平化的所有组件列表
const allComponents = editorStore.allComponents

console.log('组件总数:', editorStore.componentCount)

// 遍历所有组件
allComponents.forEach(component => {
  console.log(`${component.label} (${component.componentName})`)
})
```

## 组件树结构示例

```typescript
// 一个完整的页面结构示例
const pageStructure: ComponentData[] = [
  {
    id: 'root',
    componentName: 'div',
    label: '根容器',
    props: {},
    styles: {
      width: '100%',
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
    },
    children: [
      {
        id: 'header-container',
        componentName: 'div',
        label: '头部容器',
        props: {},
        styles: {
          width: '100%',
          height: '60px',
          display: 'flex',
          alignItems: 'center',
          backgroundColor: '#409eff',
        },
        children: [
          {
            id: 'header-title',
            componentName: 'div',
            label: '标题',
            props: {},
            styles: {
              fontSize: '18px',
              fontWeight: 'bold',
              color: '#ffffff',
            },
            children: [],
          },
          {
            id: 'header-button',
            componentName: 'el-button',
            label: '按钮',
            props: {
              type: 'primary',
              plain: true,
            },
            styles: {},
            children: [],
          },
        ],
        isContainer: true,
      },
      {
        id: 'content-container',
        componentName: 'div',
        label: '内容容器',
        props: {},
        styles: {
          width: '100%',
          flex: '1',
          padding: '20px',
        },
        children: [
          {
            id: 'form-container',
            componentName: 'el-card',
            label: '表单卡片',
            props: {
              shadow: 'hover',
            },
            styles: {
              width: '100%',
              marginBottom: '20px',
            },
            children: [
              {
                id: 'username-input',
                componentName: 'el-input',
                label: '用户名输入框',
                props: {
                  placeholder: '请输入用户名',
                },
                styles: {
                  width: '100%',
                  marginBottom: '10px',
                },
                children: [],
              },
              {
                id: 'password-input',
                componentName: 'el-input',
                label: '密码输入框',
                props: {
                  placeholder: '请输入密码',
                  showPassword: true,
                },
                styles: {
                  width: '100%',
                  marginBottom: '10px',
                },
                children: [],
              },
              {
                id: 'submit-button',
                componentName: 'el-button',
                label: '提交按钮',
                props: {
                  type: 'primary',
                },
                styles: {},
                children: [],
              },
            ],
            isContainer: true,
          },
        ],
        isContainer: true,
      },
    ],
    isContainer: true,
  },
]
```

## 最佳实践

### 1. 组件 ID 生成

使用时间戳或 UUID 生成唯一 ID：

```typescript
// 使用时间戳
const id = `component-${Date.now()}`

// 使用 UUID（推荐）
import { v4 as uuidv4 } from 'uuid'
const id = uuidv4()
```

### 2. 容器组件判断

在添加子组件前，检查父组件是否为容器：

```typescript
const parent = editorStore.findComponentById(parentId)
if (parent && parent.isContainer) {
  editorStore.addComponent(newComponent, parentId)
} else {
  console.error('目标组件不是容器，无法添加子组件')
}
```

### 3. 样式单位

推荐使用标准 CSS 单位：

```typescript
styles: {
  width: '100%',        // 百分比
  height: '200px',      // 像素
  padding: '10px 20px', // 多值
  fontSize: '14px',     // 字体大小
  gap: '1rem',          // rem 单位
}
```

### 4. 事件绑定

使用 events 字段绑定事件处理函数：

```typescript
const button: ComponentData = {
  id: 'submit-button',
  componentName: 'el-button',
  props: { type: 'primary' },
  styles: {},
  events: {
    onClick: 'handleSubmit',
    onMouseenter: 'handleHover',
  },
  children: [],
}
```

### 5. 条件渲染

使用 conditions 字段配置条件渲染：

```typescript
const conditionalComponent: ComponentData = {
  id: 'admin-panel',
  componentName: 'div',
  props: {},
  styles: {},
  conditions: [
    {
      field: 'userRole',
      operator: 'equals',
      value: 'admin',
      action: 'show',
    },
  ],
  children: [],
}
```

## 注意事项

1. **根组件不可删除**：`deleteComponent('root')` 会报错
2. **容器检查**：添加子组件前必须检查父组件是否为容器
3. **历史记录**：每次修改都会保存历史，支持撤销/重做
4. **深拷贝**：历史记录使用 JSON 深拷贝，避免引用问题
5. **样式合并**：更新样式时会保留原有样式，只更新指定字段

## 扩展建议

1. **添加更多物料组件**：在 `materials` 数组中定义新的组件类型
2. **实现拖拽排序**：添加 `moveComponent` action 支持组件移动
3. **添加复制粘贴**：实现 `copyComponent` 和 `pasteComponent` action
4. **实现组件锁定**：使用 `isLocked` 字段防止误操作
5. **添加动画配置**：使用 `animations` 字段配置组件动画