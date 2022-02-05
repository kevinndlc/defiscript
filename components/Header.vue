<template>
  <header>
    <div class="max-w-7xl mx-auto px-4">
      <div class="relative flex justify-between items-center py-6">
        <div class="flex-shrink-0">
          <span class="sr-only">DefiScript</span>
          <img class="h-10 w-auto" src="~assets/img/header-logo.png" alt="DefiScript Logo" />
        </div>
        <div class="flex items-center flex-shrink-0">
          <div
            v-if="userAccount && userRessources"
            class="hidden sm:flex items-center"
          >
            <img
              v-if="nrjToRecover > 0"
              class="h-6 w-6 mr-2 cursor-pointer"
              src="~assets/img/plus.svg"
              alt="Plus"
              @click="recoverNrj"
            />
            <span class="text-gray-200 font-medium mr-2"
              >{{ userRessources.energy.toLocaleString('en') }} /
              {{ userRessources.max_energy.toLocaleString('en') }}</span
            >
            <img class="h-8 w-8 mr-2" src="~assets/img/nrj.png" alt="Energy" />
          </div>
          <div class="flex items-center gap-4">
            <div v-if="!userAccount" class="hidden sm:block">
              <label for="rpc" class="text-white font-medium">RPC :</label>
              <select
                id="rpc"
                v-model="favoriteRpc"
                class="bg-transparent text-secondary"
              >
                <option v-for="rpc in rpcList" :key="rpc">{{ rpc }}</option>
              </select>
            </div>
            <PrimaryButton v-if="!userAccount" @click="handleLogin">
              Log in
            </PrimaryButton>
            <PrimaryButton v-else @click="showRessources = !showRessources">{{
              showRessourcesText
            }}</PrimaryButton>
          </div>
        </div>
        <transition v-if="userAccount" name="fade">
          <RessourcesCard
            v-show="showRessources && userRessources"
            class="
              absolute
              w-full
              bg-gray-800
              border-2
              p-4
              border-primary
              z-50
              right-0
              top-20
            "
          />
        </transition>
      </div>
    </div>
  </header>
</template>

<script>
import * as waxjs from '@waxio/waxjs/dist'
import CustomNotification from '~/components/CustomNotification.vue'

export default {
  data() {
    return {
      showRessources: false,
      rpcList: [
        'https://api.wax.greeneosio.com',
        'https://wax.cryptolions.io',
        'https://api-wax.eosauthority.com',
        'https://wax.greymass.com',
        'https://wax.alohaeos.com',
        'https://wax.waxsweden.com',
        'https://wax.pink.com',
        'https://wax.dapplica.com',
        'https://wax.eosphere.com',
      ],
      favoriteRpc: localStorage.getItem('favoriteRpc')
        ? localStorage.getItem('favoriteRpc')
        : 'https://api.wax.greeneosio.com',
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
    userDMT() {
      return this.$store.getters.userDMT
    },
    userDMC() {
      return this.$store.getters.userDMC
    },
    userDME() {
      return this.$store.getters.userDME
    },
    userRessources() {
      return this.$store.state.userRessources
    },
    nrjToRecover() {
      return this.userRessources.max_energy - this.userRessources.energy
    },
    showRessourcesText() {
      return this.showRessources ? 'Close' : this.userAccount
    },
  },
  watch: {
    favoriteRpc(newVal) {
      localStorage.setItem('favoriteRpc', newVal)
    },
  },
  methods: {
    async handleLogin() {
      this.$store.dispatch(
        'getWax',
        new waxjs.WaxJS({
          rpcEndpoint: this.favoriteRpc,
          tryAutoLogin: true
        })
      )
      await this.$store.dispatch('getUserAccount')
      if (this.userAccount) {
        this.$toast.success(
          {
            component: CustomNotification,
            props: {
              title: 'Login success',
              message: `You're now logged as ${this.userAccount}`,
            },
          },
          {
            timeout: 3000,
          }
        )
      }
    },

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
  },
}
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.5s;
}
.fade-enter,
.fade-leave-to {
  opacity: 0;
}

select:focus > option:checked {
  background: #d87226;
  color: white;
}
</style>
