<template>
  <GlassCard v-if="userRigs.length > 0" class="rounded-xl w-full h-full p-4 pt-3 overflow-hidden">
    <div class="flex justify-between items-center border-b-2 border-gray-400 mb-2 pb-2">
      <div class="flex items-center">
        <h2 class="text-gray-200 text-xl font-semibold">
          Rigs ({{ userRigs.length }})
        </h2>
        <button v-if="sumRigsDurability" class="ml-2 text-xs sm:text-sm text-primary hover:text-secondary font-bold" @click="repairAllRigs">REPAIR ALL</button>
      </div>
      <div>
        <MySwitch id="toggleRigs" label="Auto Claim" :checked="autoClaimRigs" @toggleSwitch="handleAutoClaimRigs"/>
      </div>
    </div>
    <div>
      <Carousel :slides="userRigs" :autoclaim="autoClaimRigs" @claimAsset="handleClaimRig"/>
      <Spinner v-if="claiming" />
    </div>
  </GlassCard>
</template>

<script>
import CustomNotification from "~/components/CustomNotification.vue"

export default {
  data() {
    return {
      autoClaimRigs: (localStorage.getItem('autoClaimRigs') === 'true'),
      claiming: false,
      claimingAssets: []
    }
  },
  computed: {
    wax() {
      return this.$store.state.wax
    },
    userRigs() {
      return this.$store.state.userRigs
    },
    userDMC() {
      return this.$store.getters.userDMC
    },
    sumRigsDurability() {
      let sum = 0
      this.userRigs.forEach(rig => (sum += rig.durability - rig.current_durability))

      return sum
    }
  },
  async mounted() {
    await this.$store.dispatch('getUserRigs')
  },
  methods: {
    handleAutoClaimRigs() {
      this.autoClaimRigs = !this.autoClaimRigs
      localStorage.setItem('autoClaimRigs', this.autoClaimRigs)
    },
    async handleClaimRig(asset, nbTry) {
      if (nbTry === 1) {
        this.claimingAssets.push(asset.asset_id)
        this.claiming = true
      }
      try {
        await this.wax.api.transact({
        actions: [{
          account: 'defiminingio',
          name: 'claimrig',
          authorization: [{
            actor: this.wax.userAccount,
            permission: 'active',
          }],
          data: {
            to: this.wax.userAccount,
            asset_id: asset.asset_id
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
            this.handleClaimRig(asset, nbTry + 1)
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
        this.$store.dispatch('getUserRigs')
      }, 1500)
    },


    async repairAllRigs() {
      const priceInDMC = this.sumRigsDurability / 100

      if (priceInDMC > this.userDMC) {
        this.$toast.error({
          component: CustomNotification,
          props: {
            title: 'Not enough DMC',
            message: `You need ${priceInDMC} DMC to repair all your rigs`
          }
        })
      } else {
        this.claiming = true
        try {
          await this.wax.api.transact({
          actions: [{
            account: 'defiminingio',
            name: 'repairall',
            authorization: [{
              actor: this.wax.userAccount,
              permission: 'active',
            }],
            data: {
              to: this.wax.userAccount,
              rig_ids: this.userRigs.filter(rig => rig.durability - rig.current_durability > 0).map(rig => rig.asset_id),
              elecsource_ids: [],
              workshop_ids: []
            },
          }]},
          {
            blocksBehind: 3,
            expireSeconds: 30
          })
        } catch (e) {
          this.$toast.error({
            component: CustomNotification,
            props: {
              title: 'Unexpected error',
              message: e.message
            }
          })
        }

        this.$toast.success({
          component: CustomNotification,
          props: {
            title: 'Successfully repaired your rigs',
            message: `Your rigs have all been repaired for a total cost of ${priceInDMC} DMC`
          }
        })

        this.claiming = false

        setTimeout(async () => {
          await this.$store.dispatch('getUserRessources')
          await this.$store.dispatch('getUserRigs')
        }, 1500)
      }
    }
  }
}
</script>