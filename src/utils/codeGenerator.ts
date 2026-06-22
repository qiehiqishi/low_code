import type { ComponentData } from '@/types/editor'

/**
 * 生成 Vue 代码
 * @param componentTree 组件树
 * @returns Vue 代码字符串
 */
export function generateVueCode(componentTree: ComponentData[]): string {
  if (!componentTree || componentTree.length === 0) {
    return ''
  }

  // 生成 template 部分
  const templateContent = generateTemplate(componentTree)

  // 生成完整的 Vue 文件
  const vueCode = `<template>
${templateContent}
</template>

<script setup lang="ts">
// 自动生成的 Vue 代码
</script>

<style scoped>
/* 组件样式 */
</style>
`

  return vueCode
}

/**
 * 生成 template 内容
 * @param components 组件数组
 * @param indent 缩进层级
 * @returns template 字符串
 */
function generateTemplate(components: ComponentData[], indent: number = 1): string {
  const indentStr = '  '.repeat(indent) // 每层缩进 2 个空格
  let result = ''

  for (const component of components) {
    // 跳过根容器（root）
    if (component.id === 'root') {
      // 递归处理子组件
      if (component.children && component.children.length > 0) {
        result += generateTemplate(component.children, indent)
      }
      continue
    }

    // 生成组件标签
    const tagStart = generateTagStart(component, indentStr)
    const tagEnd = generateTagEnd(component, indentStr)

    // 处理子组件
    if (component.children && component.children.length > 0) {
      const childrenContent = generateTemplate(component.children, indent + 1)
      result += `${tagStart}\n${childrenContent}\n${tagEnd}\n`
    } else {
      // 无子组件，直接闭合
      result += `${tagStart}${generateTagContent(component)}${tagEnd}\n`
    }
  }

  return result.trim()
}

/**
 * 生成标签开始部分
 * @param component 组件数据
 * @param indentStr 缩进字符串
 * @returns 标签开始字符串
 */
function generateTagStart(component: ComponentData, indentStr: string): string {
  const tagName = getTagName(component.componentName)
  const attributes = generateAttributes(component)
  const styles = generateStyles(component.styles)

  // 合并属性和样式
  const allAttributes = `${attributes}${styles ? ` style="${styles}"` : ''}`

  return `${indentStr}<${tagName}${allAttributes}>`
}

/**
 * 生成标签结束部分
 * @param component 组件数据
 * @param indentStr 缩进字符串
 * @returns 标签结束字符串
 */
function generateTagEnd(component: ComponentData, indentStr: string): string {
  const tagName = getTagName(component.componentName)
  return `${indentStr}</${tagName}>`
}

/**
 * 生成标签内容（文本内容）
 * @param component 组件数据
 * @returns 标签内容字符串
 */
function generateTagContent(component: ComponentData): string {
  // 处理按钮等组件的文本内容
  if (component.componentName === 'el-button') {
    return component.props.text || component.label || '按钮'
  }

  // 其他组件默认无内容
  return ''
}

/**
 * 获取标签名称
 * @param componentName 组件名称
 * @returns 标签名称
 */
function getTagName(componentName: string): string {
  // Element Plus 组件保持原名
  if (componentName.startsWith('el-')) {
    return componentName
  }

  // 原生 HTML 元素
  return componentName
}

/**
 * 生成属性字符串
 * @param component 组件数据
 * @returns 属性字符串
 */
function generateAttributes(component: ComponentData): string {
  const props = component.props
  let attributes = ''

  // 遍历所有属性
  for (const [key, value] of Object.entries(props)) {
    // 跳过特殊属性
    if (key === 'text' || key === 'class' || key === 'style') {
      continue
    }

    // 处理布尔值
    if (typeof value === 'boolean') {
      if (value) {
        attributes += ` ${key}`
      }
    }
    // 处理字符串和数字
    else if (value !== undefined && value !== null && value !== '') {
      attributes += ` ${key}="${value}"`
    }
  }

  return attributes
}

/**
 * 生成样式字符串
 * @param styles 样式对象
 * @returns 样式字符串
 */
function generateStyles(styles: Record<string, any>): string {
  if (!styles || Object.keys(styles).length === 0) {
    return ''
  }

  const styleArray: string[] = []

  // 遍历所有样式
  for (const [key, value] of Object.entries(styles)) {
    if (value !== undefined && value !== null && value !== '' && value !== 'auto') {
      // 转换 CSS 属性名（驼峰转短横线）
      const cssKey = camelToKebab(key)
      styleArray.push(`${cssKey}: ${value}`)
    }
  }

  return styleArray.join('; ')
}

/**
 * 驼峰转短横线
 * @param str 驼峰字符串
 * @returns 短横线字符串
 */
function camelToKebab(str: string): string {
  return str.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase()
}

/**
 * 生成纯 template 代码（不含 script 和 style）
 * @param componentTree 组件树
 * @returns template 代码字符串
 */
export function generateTemplateCode(componentTree: ComponentData[]): string {
  if (!componentTree || componentTree.length === 0) {
    return ''
  }

  const templateContent = generateTemplate(componentTree)
  return templateContent
}

/**
 * 格式化代码（添加缩进和换行）
 * @param code 代码字符串
 * @returns 格式化后的代码
 */
export function formatCode(code: string): string {
  // 简单的代码格式化（可以后续优化）
  return code.trim()
}

/**
 * 导出代码生成器配置
 */
export const codeGeneratorConfig = {
  indentSize: 2, // 缩进大小
  indentChar: ' ', // 缩进字符
  lineBreak: '\n', // 换行符
}