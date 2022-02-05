<template>
  <div>
    <h3 class="text-md">{{ title }}</h3>
    <span class="text-xs">{{ message }}</span>
  </div>
</template>

<script>
export default {
  props: {
    title: {
      type: String,
      required: true
    },
    message: {
      type: String,
      default: 'Message'
    }
  }
}
</script>