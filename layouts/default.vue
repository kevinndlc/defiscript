<template>
  <main class="relative min-h-screen w-screen">
    <Header />
    <Nuxt />
    <Footer />
  </main>
</template>

<style scoped>
  main {
    display: grid;
    grid-template-rows: auto 1fr auto;
  }
</style>

<style>
  main {
    background: url('~assets/img/bg.webp') no-repeat center center / cover;
    background-color: rgba(0, 0, 0, 0.5);
    background-blend-mode: multiply;
    }

  ::-webkit-scrollbar {
    height: 0px;
    width: 5px;
  }

  ::-webkit-scrollbar-track {
    background: rgb(75, 85, 99);
  }

  ::-webkit-scrollbar-thumb {
    background: #d87226;
  }
</style>