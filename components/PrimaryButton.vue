<template>
  <button 
    class="whitespace-nowrap inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-primary hover:bg-secondary"
    @click="$emit('click')">
    <slot />
  </button>
</template>