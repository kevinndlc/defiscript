<template>
  <div class="flex items-center justify-center">
    <label :for="id" class="flex items-center cursor-pointer">
      <span class="mr-2 text-gray-200 font-medium hidden sm:block">{{ label }}</span>
      <div class="relative">
        <input :id="id" type="checkbox" class="sr-only" :checked="checked" @change="$emit('toggleSwitch')">
        <div class="block bg-gray-200 w-12 h-7 rounded-full"></div>
        <div class="dot absolute left-1 top-1 bg-gray-800 w-5 h-5 rounded-full transition"></div>
      </div>
    </label>
  </div>
</template>

<script>
export default {
  props: {
    id: {
      type: String,
      required: true
    },
    label: {
      type: String,
      default: 'Toggle Switch'
    },
    checked: {
      type: Boolean,
      default: false
    }
  }
}
</script>

<style scoped>
  input:checked ~ .dot {
    transform: translateX(100%);
    background-color: #d87226;
  }
</style>