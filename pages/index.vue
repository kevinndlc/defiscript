<template>
  <div>
    <HomeSection v-if="!userAccount" />
    <DashboardSection v-else />
  </div>
</template>

<script>
export default {
  computed: {
    userAccount() {
      return this.$store.state.userAccount
    }
  }
}
</script>