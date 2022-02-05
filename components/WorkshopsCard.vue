<template>
  <GlassCard v-if="userWorkshops.length > 0" class="rounded-xl w-full h-full p-4 pt-3 overflow-hidden">
    <div class="flex justify-between items-center border-b-2 border-gray-400 mb-2 pb-2">
      <div class="flex items-center">
        <h2 class="text-gray-200 text-xl font-semibold">
          Workshop ({{ userWorkshops.length }})
        </h2>
        <button v-if="sumWorkshopsDurability" class="ml-2 text-xs sm:text-sm text-primary hover:text-secondary font-bold" @click="repairAllWorkshops">REPAIR ALL</button>
      </div>
      <div>
        <MySwitch id="toggleWorkshops" label="Auto Claim" :checked="autoClaimWorkshops" @toggleSwitch="handleAutoClaimWorkshops"/>
      </div>
    </div>
    <div>
      <Carousel :slides="userWorkshops" :autoclaim="autoClaimWorkshops" @claimAsset="handleClaimWorkshop"/>
      <Spinner v-if="claiming" />
    </div>
  </GlassCard>
</template>

<script>
import CustomNotification from "~/components/CustomNotification.vue"

export default {
  data() {
    return {
      autoClaimWorkshops: (localStorage.getItem('autoClaimWorkshops') === 'true'),
      claiming: false,
      claimingAssets: []
    }
  },
  computed: {
    wax() {
      return this.$store.state.wax
    },
    userWorkshops() {
      return this.$store.state.userWorkshops
    },
    sumWorkshopsDurability() {
      let sum = 0
      this.userWorkshops.forEach(workshop => (sum += workshop.durability - workshop.current_durability))

      return sum
    }
  },
  async mounted() {
    await this.$store.dispatch('getUserWorkshops')
  },
  methods: {
    handleAutoClaimWorkshops() {
      this.autoClaimWorkshops = !this.autoClaimWorkshops
      localStorage.setItem('autoClaimWorkshops', this.autoClaimWorkshops)
    },

    async handleClaimWorkshop(asset, nbTry) {
      if (nbTry === 1) {
        this.claimingAssets.push(asset.asset_id)
        this.claiming = true
      }
      try {
        await this.wax.api.transact({
        actions: [{
          account: 'defiminingio',
          name: 'claimdmc',
          authorization: [{
            actor: this.wax.userAccount,
            permission: 'active',
          }],
          data: {
            username: this.wax.userAccount
          },
        }]},
        {
          blocksBehind: 3,
          expireSeconds: 30
        })

        this.$toast.success({
          component: CustomNotification,
          props: {
            title: `Successfully claimed your ${asset.name}`,
            message: `You've mined some ${asset.rewards_token}`
          }
        })
      } catch(e) {
        if (nbTry < 10) {
          setTimeout(() => {
            this.handleClaimWorkshop(asset, nbTry + 1)
          }, 3000)
          return null
        } else {
          this.$toast.error({
            component: CustomNotification,
            props: {
              title: 'Unexpected error',
              message: e.message
            }
          })
        }
      }

      this.claimingAssets.splice(this.claimingAssets.indexOf(asset.asset_id), 1)

      if (this.claimingAssets.length === 0) {
        this.claiming = false
      }

      setTimeout(() => {
        this.$store.dispatch('getUserRessources')
        this.$store.dispatch('getUserWorkshops')
      }, 1500)
    },

    repairAllWorkshops() {
      console.log('DONE');
    }
  }
}
</script>