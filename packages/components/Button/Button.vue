<script setup lang="ts">
  import { ref, computed, inject } from 'vue'
  import type { ButtonProps, ButtonEmits, ButtonInstance } from './types'
  import { BUTTON_GROUP_CTX_KEY } from './constants'
  import { throttle } from 'lodash-es'
  import ErIcon from '../Icon/Icon.vue'

  defineOptions({
    name: 'ErButton',
  })
  const _ref = ref<HTMLButtonElement>()

  const props = withDefaults(defineProps<ButtonProps>(), {
    tag: 'button',
    nativeType: 'button',
    useThrottle: true,
    throttleDuration: 500,
  })
  const slots = defineSlots()
  const buttonGroupCtx = inject(BUTTON_GROUP_CTX_KEY, void 0)

  const emits = defineEmits<ButtonEmits>()

  const size = computed(() => buttonGroupCtx?.size ?? props?.size ?? '')
  const type = computed(() => buttonGroupCtx?.type ?? props?.type ?? '')
  const disabled = computed(() => props.disabled || buttonGroupCtx?.disabled || false)
  const iconStyle = computed(() => ({
    marginRight: slots.default ? '6px' : '0px',
  }))

  const handleBtnClick = (e: MouseEvent) => {
    emits('click', e)
  }
  const handleBtnClickThrottle = throttle(handleBtnClick, props.throttleDuration, { trailing: false })

  defineExpose<ButtonInstance>({
    ref: _ref,
    disabled,
    size,
    type,
  })
</script>
<template>
  <component
    :is="tag"
    ref="_ref"
    class="er-button"
    :type="tag === 'button' ? nativeType : void 0"
    :disabled="disabled || loading"
    :class="{
      [`er-button--${type}`]: type,
      [`er-button--${size}`]: size,
      'is-plain': plain,
      'is-round': round,
      'is-circle': circle,
      'is-disabled': disabled,
      'is-loading': loading,
    }"
    :autofocus="autofocus"
    @click="(e: MouseEvent) => (useThrottle ? handleBtnClickThrottle(e) : handleBtnClick(e))"
  >
    <template v-if="loading">
      <slot name="loading">
        <er-icon
          class="loading-icon"
          :icon="loadingIcon ?? 'spinner'"
          :style="iconStyle"
          size="1x"
          spin
        />
      </slot>
    </template>
    <er-icon
      v-if="icon && !loading"
      :icon="icon"
      size="1x"
      :style="iconStyle"
    />
    <slot></slot>
  </component>
</template>
<style scoped>
  @import url(./style.css);
</style>
