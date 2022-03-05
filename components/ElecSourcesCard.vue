<template>
  <GlassCard v-if="userElecSources.length > 0" class="rounded-xl w-full h-full p-4 pt-3 overflow-hidden">
    <div class="flex justify-between items-center border-b-2 border-gray-400 mb-2 pb-2">
      <div class="flex items-center">
        <h2 class="text-gray-200 text-xl font-semibold">
          Electricity ({{ userElecSources.length }})
        </h2>
        <button v-if="sumElecSourcesDurability" class="ml-2 text-xs sm:text-sm text-primary hover:text-secondary font-bold" @click="repairAllElecSources">REPAIR ALL</button>
      </div>
      <div>
        <MySwitch id="toggleElectricity" label="Auto Claim" :checked="autoClaimElecSources" @toggleSwitch="handleAutoClaimElecSources"/>
      </div>
    </div>
    <div>
      <Carousel :slides="userElecSources" :autoclaim="autoClaimElecSources" @claimAsset="handleClaimElecSource"/>
      <Spinner v-if="claiming" />
    </div>
  </GlassCard>
</template>

<script>
import CustomNotification from "~/components/CustomNotification.vue"

export default {
  data() {
    return {
      autoClaimElecSources: (localStorage.getItem('autoClaimElecSources') === 'true'),
      claiming: false,
      claimingAssets: []
    }
  },
  computed: {
    wax() {
      return this.$store.state.wax
    },
    userElecSources() {
      return this.$store.state.userElecSources
    },
    userDMC() {
      return this.$store.getters.userDMC
    },
    sumElecSourcesDurability() {
      let sum = 0
      this.userElecSources.forEach(elecSource => (sum += elecSource.durability - elecSource.current_durability))

      return sum
    }
  },
  async mounted() {
    await this.$store.dispatch('getUserElecSources')
  },
  methods: {
    handleAutoClaimElecSources() {
      this.autoClaimElecSources = !this.autoClaimElecSources
      localStorage.setItem('autoClaimElecSources', this.autoClaimElecSources)
    },

    async handleClaimElecSource(asset, nbTry) {
      if (nbTry === 1) {
        this.claimingAssets.push(asset.asset_id)
        this.claiming = true
      }
      try {
        await this.wax.api.transact({
        actions: [{
          account: 'defiminingio',
          name: 'claimelec',
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
            this.handleClaimElecSource(asset, nbTry + 1)
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
        this.$store.dispatch('getUserElecSources')
      }, 1500)
    },

    async repairAllElecSources() {
      const priceInDMC = this.sumElecSourcesDurability / 100

      if (priceInDMC > this.userDMC) {
        this.$toast.error({
          component: CustomNotification,
          props: {
            title: 'Not enough DMC',
            message: `You need ${priceInDMC} DMC to repair all your electricity sources`
          }
        })
      } else {
        this.claiming = true
        await Promise.all(this.userElecSources.map(async (elecSource) => {
          if (elecSource.durability - elecSource.current_durability > 0) {
            try {
              await this.wax.api.transact({
              actions: [{
                account: 'defiminingio',
                name: 'repairelec',
                authorization: [{
                  actor: this.wax.userAccount,
                  permission: 'active',
                }],
                data: {
                  to: this.wax.userAccount,
                  asset_id: elecSource.asset_id
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
          }
        }))

        this.$toast.success({
          component: CustomNotification,
          props: {
            title: 'Successfully repaired your electricity sources',
            message: `Your electricity sources have all been repaired for a total cost of ${priceInDMC} DMC`
          }
        })

        this.claiming = false

        setTimeout(async () => {
          await this.$store.dispatch('getUserRessources')
          await this.$store.dispatch('getUserElecSources')
        }, 1500)
      }
    }
  }
}
</script>