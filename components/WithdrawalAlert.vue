<template>
  <GlassCard v-if="withdrawalFee" class="rounded-xl w-full p-4 overflow-hidden">
      <h3 :class="'text-sm font-medium ' + alertColor">
        Current withdrawal fee is {{ withdrawalFee }}%
      </h3>
  </GlassCard>
</template>

<script>
export default {
  computed: {
    withdrawalFee() {
      return this.$store.state.withdrawalFee
    },
    alertColor() {
      return this.withdrawalFee === 5 ? 'text-green-500' : this.withdrawalFee > 5 && this.withdrawalFee < 8 ? 'text-yellow-500' : 'text-red-500'
    }
  },
  async mounted() {
    await this.$store.dispatch('getWithdrawalFee')

    setInterval(async () => {
      await this.$store.dispatch('getWithdrawalFee')
    }, 60000)
  }
}
</script>