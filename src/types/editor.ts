/**
 * 低代码编辑器核心类型定义
 */

// 组件样式类型
export interface ComponentStyles {
  width?: string // 宽度
  height?: string // 高度
  padding?: string // 内边距
  margin?: string // 外边距
  backgroundColor?: string // 背景色
  color?: string // 文字颜色
  fontSize?: string // 字体大小
  fontWeight?: string // 字体粗细
  textAlign?: 'left' | 'center' | 'right' // 文本对齐
  border?: string // 边框
  borderRadius?: string // 圆角
  display?: 'block' | 'inline' | 'flex' | 'grid' // 显示方式
  flexDirection?: 'row' | 'column' // Flex 方向
  justifyContent?: string // Flex 主轴对齐
  alignItems?: string // Flex 交叉轴对齐
  gap?: string // Flex/Grid 间距
  position?: 'static' | 'relative' | 'absolute' | 'fixed' // 定位方式
  top?: string // 上边距
  right?: string // 右边距
  bottom?: string // 下边距
  left?: string // 左边距
  zIndex?: number // 层级
  opacity?: number // 透明度
  boxShadow?: string // 阴影
  overflow?: 'visible' | 'hidden' | 'auto' | 'scroll' // 溢出处理
  cursor?: string // 鼠标样式
  [key: string]: any // 其他样式属性
}

// 组件属性类型
export interface ComponentProps {
  [key: string]: any
}

// 核心组件数据结构（递归树形结构）
export interface ComponentData {
  id: string // 组件唯一标识（UUID）
  componentName: string // 组件名称（如 'el-button', 'el-input', 'div'）
  label?: string // 组件显示名称（可选，用于编辑器展示）
  props: ComponentProps // 组件属性对象（如按钮的 type、size）
  styles: ComponentStyles // 组件样式对象
  children?: ComponentData[] // 子组件数组（递归，支持嵌套容器）
  parentId?: string // 父组件ID（可选，用于快速定位父级）
  slotName?: string // 插槽名称（可选，用于 Vue 插槽）
  isContainer?: boolean // 是否为容器组件（可选，用于编辑器判断）
  isLocked?: boolean // 是否锁定（可选，防止误操作）
  isVisible?: boolean // 是否可见（可选，控制显示隐藏）
  events?: Record<string, string> // 事件绑定（可选，如 { onClick: 'handleClick' } })
  animations?: AnimationConfig[] // 动画配置（可选）
  conditions?: ConditionConfig[] // 条件渲染配置（可选）
}

// 动画配置
export interface AnimationConfig {
  name: string // 动画名称
  duration?: number // 持续时间（毫秒）
  delay?: number // 延迟时间（毫秒）
  easing?: string // 缓动函数
  trigger?: 'auto' | 'click' | 'hover' | 'scroll' // 触发方式
}

// 条件渲染配置
export interface ConditionConfig {
  field: string // 字段名
  operator: 'equals' | 'notEquals' | 'contains' | 'greaterThan' | 'lessThan' // 操作符
  value: any // 比较值
  action: 'show' | 'hide' | 'enable' | 'disable' // 动作
}

// 组件树（页面结构）
export interface ComponentTree {
  id: string // 页面ID
  name: string // 页面名称
  root: ComponentData // 根节点
  description?: string // 页面描述（可选）
  thumbnail?: string // 缩略图URL（可选）
  createdAt?: string // 创建时间（可选）
  updatedAt?: string // 更新时间（可选）
}

// 物料组件定义（左侧物料库）
export interface MaterialComponent {
  type: string // 组件类型
  label: string // 显示名称
  icon?: string // 图标
  category: string // 分类（如 '基础组件', '表单组件'）
  defaultProps: ComponentProps // 默认属性
  defaultStyles?: ComponentStyles // 默认样式
  schema?: PropSchema[] // 属性配置schema
  styleSchema?: PropSchema[] // 样式配置schema
  isContainer?: boolean // 是否为容器组件
}

// 属性配置schema（右侧属性面板）
export interface PropSchema {
  name: string // 属性名
  label: string // 显示名称
  type: 'string' | 'number' | 'boolean' | 'select' | 'color' | 'object' // 类型
  default?: any // 默认值
  options?: { label: string; value: any }[] // 选项（用于select类型）
  required?: boolean // 是否必填
  description?: string // 描述
}

// 编辑器状态
export interface EditorState {
  currentPage: ComponentTree | null // 当前页面
  selectedComponent: ComponentNode | null // 选中的组件
  hoveredComponent: ComponentNode | null // hover的组件
  history: ComponentTree[] // 历史记录（用于撤销/重做）
  historyIndex: number // 当前历史索引
}

// 拖拽事件数据
export interface DragEventData {
  component: MaterialComponent // 拖拽的物料组件
  targetId?: string // 目标组件ID
  position?: 'before' | 'after' | 'inside' // 插入位置
}