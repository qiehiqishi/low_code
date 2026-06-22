import type { ComponentData, MaterialComponent } from '@/types/editor'

/**
 * 根据物料定义生成组件数据
 * @param material 物料组件定义
 * @returns 组件数据对象
 */
export function createComponentFromMaterial(material: MaterialComponent): ComponentData {
  // 生成唯一 ID（使用时间戳）
  const id = `comp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`

  // 创建组件数据
  const component: ComponentData = {
    id,
    componentName: material.type,
    label: material.label,
    props: { ...material.defaultProps }, // 复制默认属性
    styles: { ...material.defaultStyles } || {}, // 复制默认样式
    children: [],
    isContainer: material.isContainer || false,
    isVisible: true,
  }

  return component
}

/**
 * 生成唯一 ID（UUID v4）
 * @returns UUID 字符串
 */
export function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    const r = Math.random() * 16 | 0
    const v = c === 'x' ? r : (r & 0x3 | 0x8)
    return v.toString(16)
  })
}

/**
 * 深拷贝组件数据（用于克隆）
 * @param component 原组件数据
 * @returns 新的组件数据
 */
export function cloneComponentData(component: ComponentData): ComponentData {
  const cloned: ComponentData = {
    id: generateUUID(), // 生成新的 ID
    componentName: component.componentName,
    label: component.label,
    props: JSON.parse(JSON.stringify(component.props)), // 深拷贝属性
    styles: JSON.parse(JSON.stringify(component.styles)), // 深拷贝样式
    children: component.children ? component.children.map(child => cloneComponentData(child)) : [],
    parentId: component.parentId,
    slotName: component.slotName,
    isContainer: component.isContainer,
    isLocked: component.isLocked,
    isVisible: component.isVisible,
    events: component.events ? JSON.parse(JSON.stringify(component.events)) : undefined,
    animations: component.animations ? JSON.parse(JSON.stringify(component.animations)) : undefined,
    conditions: component.conditions ? JSON.parse(JSON.stringify(component.conditions)) : undefined,
  }

  return cloned
}