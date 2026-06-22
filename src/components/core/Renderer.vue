<script setup lang="ts">
import { h, defineComponent } from 'vue'
import type { ComponentData } from '@/types/editor'
import * as ElementPlusComponents from 'element-plus'

// Props定义
interface Props {
  component: ComponentData  // 组件数据
  selected?: boolean        // 是否选中
  hovered?: boolean         // 是否hover
}

const props = withDefaults(defineProps<Props>(), {
  selected: false,
  hovered: false,
})

/**
 * 动态渲染组件
 * @param componentData 组件数据
 * @returns Vue VNode
 */
const renderComponent = (componentData: ComponentData) => {
  // 获取组件实例
  let component: any = null
  
  // 处理 Element Plus 组件
  if (componentData.componentName.startsWith('el-')) {
    // 转换组件名称：el-button -> ElButton
    const componentName = componentData.componentName
      .replace('el-', '')
      .split('-')
      .map((s, i) => s.charAt(0).toUpperCase() + s.slice(1))
      .join('')
    
    // 从 Element Plus 获取组件
    component = ElementPlusComponents[`El${componentName}`]
  } 
  // 处理原生 HTML 元素
  else if (componentData.componentName === 'div') {
    component = 'div'
  } else if (componentData.componentName === 'span') {
    component = 'span'
  } else if (componentData.componentName === 'p') {
    component = 'p'
  }

  // 如果组件不存在，显示占位符
  if (!component) {
    return h('div', { 
      class: 'renderer-unknown',
      style: {
        padding: '10px',
        backgroundColor: '#f5f5f5',
        border: '1px dashed #ccc',
        color: '#999',
        fontSize: '12px',
      }
    }, `未知组件: ${componentData.componentName}`)
  }

  // 渲染子组件
  const children = componentData.children?.map(child => renderComponent(child)) || []

  // 合并属性和样式
  const componentProps = {
    ...componentData.props,  // 组件属性
    style: {
      ...componentData.styles,  // 组件样式
    },
  }

  // 渲染组件
  return h(
    component,
    componentProps,
    children.length > 0 ? children : undefined
  )
}

/**
 * 渲染函数
 */
const render = () => {
  return h('div', {
    class: 'renderer-wrapper',
  }, [
    // 渲染组件
    renderComponent(props.component),
    
    // 选中指示器（仅在编辑器模式下显示）
    props.selected && h('div', {
      class: 'renderer-indicator renderer-indicator--selected',
      style: {
        position: 'absolute',
        top: '0',
        left: '0',
        right: '0',
        bottom: '0',
        border: '2px solid #409eff',
        backgroundColor: 'rgba(64, 158, 255, 0.05)',
        pointerEvents: 'none',
        zIndex: 999,
      }
    }),
    
    // hover指示器（仅在编辑器模式下显示）
    props.hovered && !props.selected && h('div', {
      class: 'renderer-indicator renderer-indicator--hovered',
      style: {
        position: 'absolute',
        top: '0',
        left: '0',
        right: '0',
        bottom: '0',
        border: '1px dashed #409eff',
        backgroundColor: 'rgba(64, 158, 255, 0.02)',
        pointerEvents: 'none',
        zIndex: 998,
      }
    }),
  ])
}

// 创建动态渲染组件
const DynamicRenderer = defineComponent({
  name: 'DynamicRenderer',
  render,
})
</script>

<template>
  <DynamicRenderer />
</template>

<style scoped>
.renderer-wrapper {
  position: relative;
  display: inline-block;
  width: 100%;
}

.renderer-unknown {
  padding: 10px;
  background-color: #f5f5f5;
  border: 1px dashed #ccc;
  color: #999;
  font-size: 12px;
  text-align: center;
}

.renderer-indicator {
  transition: all 0.2s;
}

.renderer-indicator--selected {
  border: 2px solid #409eff;
  background-color: rgba(64, 158, 255, 0.05);
}

.renderer-indicator--hovered {
  border: 1px dashed #409eff;
  background-color: rgba(64, 158, 255, 0.02);
}
</style>