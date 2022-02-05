<template>
  <div class="card w-full">
    <div class="content">
      <slot />
    </div>
  </div>
</template>

<style>
  .card {
    background: rgba(255, 255, 255, 0.20);
    backdrop-filter: blur(5px);
    border: solid 2px transparent;
    background-clip: padding-box;
    box-shadow: 10px 10px 10px rgba(46, 54, 68, 0.03);
    z-index: 1;
  }
</style>