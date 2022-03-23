<template>
  <div class="rssgrid rounded-xl overflow-hidden">
    <!-- Ressource Details -->
    <div class="rssdetail border-b-2 sm:border-b-0 sm:border-r-2 text-gray-200 border-primary pb-4 sm:pb-0 sm:pr-4">
      <div>
        <div class="sm:flex justify-between items-center">
          <div>
            <h2 class="text-sm sm:text-lg text-white font-medium">Currently logged as <span class="font-bold text-primary">{{ userAccount }}</span></h2>
            <span class="text-xs font-medium">Balance: {{ userBalance }} WAX (${{ userBalanceInUsd }})</span>
          </div>
          <div class="hidden md:inline-block bg-primary rounded-lg py-2 px-3 text-white font-medium">CPU: {{ userCpuPercentage }}%</div>
        </div>
        <hr class="my-3 sm:mb-0">
      </div>
      <div v-if="!currentDetails" class="text-center sm:text-lg grid place-content-center">
        <span class="hidden sm:inline text-gray-200">Click on a resource on the right to get a detailed view</span>
        <span class="sm:hidden text-gray-200">Click on a resource below to get a detailed view</span>
      </div>
      <div v-else class="text-center text-sm sm:text-base grid place-content-center">
        <div v-if="currentDetails">
          <h3 v-if="rssDetails.name" class="text-lg sm:text-2xl font-medium underline">{{ rssDetails.name }}</h3>
          <p class="mt-2">Price: {{ rssDetails.price }} WAX (${{ rssDetails.priceInUsd }})</p>
          <p class="mt-4">Total owned: {{ (rssDetails.quantity * rssDetails.price).toFixed(2) }} WAX (${{ (rssDetails.quantity * rssDetails.priceInUsd).toFixed(2) }})</p>
          <a class="inline-block text-primary font-medium mt-4" :href="rssDetails.tradeUrl" target="_blank">Trade on Alcor Exchange</a>
        </div>

        <div class="relative h-6">
          <Spinner v-if="loading"/>
        </div>
      </div>
      <div class="mt-3 sm:mt-0 flex justify-between">
        <span v-if="withdrawalFee" class="text-xs font-medium">Withdrawal fee: {{ withdrawalFee }}%</span>
        <span v-if="waxPrice" class="text-xs font-medium">1 WAX ≈ {{ waxPrice.toFixed(5) }}$</span>
      </div>
    </div>

    <!-- Ressources -->
    <div>
      <div class="sm:hidden">
        <h2 class="text-lg text-white font-medium underline mt-2 sm:mt-0">Energy</h2>
        <div class="flex justify-center items-center mt-2">
          <img v-if="nrjToRecover > 0" class="h-8 w-8 mr-2 cursor-pointer" src="~assets/img/plus.svg" alt="Plus" @click="recoverNrj">
          <span class="text-gray-200 text-sm font-medium mr-2">{{ userRessources.energy }} / {{ userRessources.max_energy }}</span>
          <img class="h-10 w-10" src="~assets/img/nrj.png" alt="Energy">
        </div>
      </div>
      <h2 class="text-lg text-white font-medium underline mt-2 sm:mt-0">Resources</h2>
      <dl class="mt-2 select-none">
        <div class="flex flex-col items-center p-2 sm:p-4 text-center cursor-pointer hover:bg-gray-600 rounded-xl" @click="currentDetails = 'DMT'">
          <dt class="text-lg leading-6 font-bold text-secondary">
            {{ userDMT.toFixed(2) }}
          </dt>
          <div class="text-2xl text-gray-200 font-bold">
            DMT
          </div>
        </div>
        <div class="flex flex-col items-center p-2 sm:p-4 text-center cursor-pointer hover:bg-gray-600 rounded-xl" @click="currentDetails = 'DMC'">
          <dt class="text-lg leading-6 font-bold text-secondary">
            {{ userDMC.toFixed(2) }}
          </dt>
          <div class="text-2xl text-gray-200 font-bold">
            DMC
          </div>
        </div>
        <div class="flex flex-col items-center p-2 sm:p-4 text-center cursor-pointer hover:bg-gray-600 rounded-xl" @click="currentDetails = 'DME'">
          <dt class="text-lg leading-6 font-bold text-secondary">
            {{ userDME.toFixed(2) }}
          </dt>
          <div class="text-2xl text-gray-200 font-bold">
            DME
          </div>
        </div>
      </dl>
      
      <h2 class="text-lg text-white font-medium underline mt-2">Options</h2>
      <div class="flex justify-between items-center mt-2">
        <label for="toggleAutoRecover" class="mr-2 text-gray-200 font-medium cursor-pointer">Auto recover</label>
        <MySwitch id="toggleAutoRecover" label="" :checked="autoRecover" @toggleSwitch="handleAutoRecover"/>
      </div>
      <hr class="mt-2">
      <div class="flex justify-between items-center mt-2">
        <label for="toggleAutoRepair" class="mr-2 text-gray-200 font-medium cursor-pointer">Auto repair</label>
        <MySwitch id="toggleAutoRepair" label="" :checked="autoRepair" @toggleSwitch="handleAutoRepair"/>
      </div>
      <hr class="mt-2">
      <div class="flex justify-between items-center mt-2">
        <label for="toggleAnimations" class="mr-2 text-gray-200 font-medium cursor-pointer">Enable animations</label>
        <MySwitch id="toggleAnimations" label="" :checked="enableAnimations" @toggleSwitch="handleEnableAnimations"/>
      </div>
    </div>
  </div>
</template>

<script>
import CustomNotification from '~/components/CustomNotification.vue'

export default {
  data() {
    return {
      autoRecover: (localStorage.getItem('autoRecover') === 'true'),
      autoRepair: (localStorage.getItem('autoRepair') === 'true'),
      enableAnimations: (localStorage.getItem('enableAnimations') === 'true'),

      recovering: false,
      repairing: false,
      loading: false,
      marketPrices: [],
      currentDetails: '',
      userTokens: []
    }
  },
  computed: {
    wax() {
      return this.$store.state.wax
    },
    userAccount() {
      return this.$store.state.userAccount
    },
    userBalance() {
      return this.$store.state.userBalance
    },
    userBalanceInUsd() {
      return Math.round(this.userBalance * this.waxPrice * 100) / 100
    },
    userCpuPercentage() {
      return ((this.$store.state.userCpu.used / this.$store.state.userCpu.max) * 100).toFixed(0)
    },
    userRessources() {
      return this.$store.state.userRessources
    },
    withdrawalFee() {
      return this.$store.state.withdrawalFee
    },
    nrjToRecover() {
      return this.userRessources.max_energy - this.userRessources.energy
    },
    userRigs() {
      return this.$store.state.userRigs
    },
    sumRigsDurability() {
      let sum = 0

      this.userRigs.forEach(rig => (sum += rig.durability - rig.current_durability))

      return sum
    },
    userElecSources() {
      return this.$store.state.userElecSources
    },
    sumElecSourcesDurability() {
      let sum = 0

      this.userElecSources.forEach(elecSource => (sum += elecSource.durability - elecSource.current_durability))

      return sum
    },

    userDMT() {
      return this.$store.getters.userDMT
    },
    userDMC() {
      return this.$store.getters.userDMC
    },
    userDME() {
      return this.$store.getters.userDME
    },
    waxPrice() {
      return this.$store.state.waxPrice
    },

    rssDetails() {
      if (this.currentDetails === 'DMT') {
        const currentToken = this.marketPrices.find(pair => pair.quote_token.symbol.name === 'DMT' && pair.quote_token.contract === 'defiminingtk')
        let currentPrice = 0
        if (currentToken) {
          currentPrice = Math.round(currentToken.last_price * 100) / 100
        }

        return {
          name: 'DMT',
          quantity: this.userDMT,
          price: currentPrice,
          priceInUsd: Math.round(currentPrice * this.waxPrice * 100) / 100,
          tradeUrl: 'https://wax.alcor.exchange/trade/dmt-defiminingtk_wax-eosio.token'
        }
      } else if (this.currentDetails === 'DMC') {
        const currentToken = this.marketPrices.find(pair => pair.quote_token.symbol.name === 'DMC' && pair.quote_token.contract === 'defiminingtk')
        let currentPrice = 0
        if (currentToken) {
          currentPrice = Math.round(currentToken.last_price * 100) / 100
        }

        return {
          name: 'DMC',
          quantity: this.userDMC,
          price: currentPrice,
          priceInUsd: Math.round(currentPrice * this.waxPrice * 100) / 100,
          tradeUrl: 'https://wax.alcor.exchange/trade/dmc-defiminingtk_wax-eosio.token'
        }
      } else if (this.currentDetails === 'DME') {
        const currentToken = this.marketPrices.find(pair => pair.quote_token.symbol.name === 'DME' && pair.quote_token.contract === 'defiminingtk')
        let currentPrice = 0
        if (currentToken) {
          currentPrice = Math.round(currentToken.last_price * 100) / 100
        }

        return {
          name: 'DME',
          quantity: this.userDME,
          price: currentPrice,
          priceInUsd: Math.round(currentPrice * this.waxPrice * 100) / 100,
          tradeUrl: 'https://wax.alcor.exchange/trade/dme-defiminingtk_wax-eosio.token'
        }
      }

      return ''
    }
  },
  watch: {
    async nrjToRecover(newVal) {
      if (newVal / this.userRessources.max_energy >= 0.5 && !this.recovering && this.autoRecover) {
        this.recovering = true
        await this.recoverNrj()
        this.recovering = false
      }
    },
    async userRigs() {
      if (this.userRigs.find(rig => rig.current_durability / rig.durability <= 0.5) && !this.repairing && this.autoRepair) {
        this.repairing = true
        await this.repairAllTools()
        this.repairing = false
      }
    }
  },
  mounted() {
    this.$store.dispatch('setAnimations', this.enableAnimations)
    this.getMarketPrices()
    this.$store.dispatch('getWaxPrice')
    this.$store.dispatch('getUserBalance')
    this.$store.dispatch('getUserRessources')
    setInterval(() => {
      this.getMarketPrices()
      this.$store.dispatch('getWaxPrice')
      this.$store.dispatch('getUserBalance')
      this.$store.dispatch('getUserRessources')
    }, 15000)
  },
  methods: {
    async recoverNrj() {
      const priceInDME = this.nrjToRecover * 0.85464 / 10000

      if (priceInDME > this.userDME) {
        this.$toast.error({
          component: CustomNotification,
          props: {
            title: 'Not enough DME',
            message: `You need ${priceInDME.toFixed(2)} DME to recover your energy`,
          },
        })
      } else {
        try {
          await this.wax.api.transact(
            {
              actions: [
                {
                  account: 'defiminingio',
                  name: 'addenergy',
                  authorization: [
                    {
                      actor: this.wax.userAccount,
                      permission: 'active',
                    },
                  ],
                  data: {
                    username: this.wax.userAccount,
                    energy: this.nrjToRecover,
                  },
                },
              ],
            },
            {
              blocksBehind: 3,
              expireSeconds: 30,
            }
          )
        } catch (e) {
          this.$toast.error({
            component: CustomNotification,
            props: {
              title: 'Unexpected error',
              message: e.message,
            },
          })
          return null
        }

        this.$toast.success({
          component: CustomNotification,
          props: {
            title: 'Successfully recovered your energy',
            message: `Your energy have been recovered for a total cost of ${priceInDME.toFixed(2)} DME`,
          },
        })

        setTimeout(async () => {
          await this.$store.dispatch('getUserRessources')
        }, 1500)
      }
    },

    async repairAllTools() {
      const priceInDMC = this.sumRigsDurability / 100 + this.sumElecSourcesDurability / 100

      if (priceInDMC > this.userDMC) {
        this.$toast.error({
          component: CustomNotification,
          props: {
            title: 'Not enough DMC',
            message: `You need ${priceInDMC} DMC to repair all your items`
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
              elecsource_ids: this.userElecSources.filter(elecSource => elecSource.durability - elecSource.current_durability > 0).map(elecSource => elecSource.asset_id),
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
            title: 'Successfully repaired your items',
            message: `Your items have all been repaired for a total cost of ${priceInDMC} DMC`
          }
        })

        this.claiming = false

        setTimeout(async () => {
          await this.$store.dispatch('getUserRessources')
          await this.$store.dispatch('getUserRigs')
          await this.$store.dispatch('getUserElecSources')
        }, 1500)
      }
    },

    handleAutoRecover() {
      this.autoRecover = !this.autoRecover
      localStorage.setItem('autoRecover', this.autoRecover)

      if (this.autoRecover) {
        this.$toast.success({
          component: CustomNotification,
          props: {
            title: 'Auto Recover enabled',
            message: 'Your energy will be automatically recovered when it drops below 50%'
          }
        })
      }
    },

    handleAutoRepair() {
      this.autoRepair = !this.autoRepair
      localStorage.setItem('autoRepair', this.autoRepair)

      if (this.autoRepair) {
        this.$toast.success({
          component: CustomNotification,
          props: {
            title: 'Auto Repair enabled',
            message: 'Your items will be automatically repaired when their durability drops below 50%'
          }
        })
      }
    },

    handleEnableAnimations() {
      this.enableAnimations = !this.enableAnimations
      localStorage.setItem('enableAnimations', this.enableAnimations)
      this.$store.dispatch('setAnimations', this.enableAnimations)
    },

    async getMarketPrices() {
      this.marketPrices = await this.$axios.$get('https://wax.alcor.exchange/api/markets')
    }
  }
}
</script>

<style scoped>
  @media screen and (min-width: 640px) {
    .rssgrid {
      display: grid;
      grid-template-columns: 1fr auto;
      gap: 1rem;
    }
  }

  .rssdetail {
    display: grid;
    grid-template-rows: auto 1fr auto;
  }

  .loader {
    bottom: 0.75rem!important;
  }
</style>