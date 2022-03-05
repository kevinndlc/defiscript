import Vuex from 'vuex'

const createStore = () => {
  // eslint-disable-next-line import/no-named-as-default-member
  return new Vuex.Store({
    state: {
      wax: '',
      waxPrice: '',
      userAccount: '',
      userBalance: null,
      userCpu: {},
      withdrawalFee: '',
      gameTemplates: [],

      userRessources: '',
      userRigs: [],
      userElecSources: [],
      userWorkshops: [],
      animations: false,
    },
    mutations: {
      setWax(state, wax) {
        state.wax = wax
      },
      setWaxPrice(state, waxPrice) {
        state.waxPrice = waxPrice
      },
      setUserAccount(state, account) {
        state.userAccount = account
      },
      setUserBalance(state, balance) {
        state.userBalance = balance
      },
      setUserCpu(state, cpu) {
        state.userCpu = cpu
      },
      setWithdrawalFee(state, fee) {
        state.withdrawalFee = fee
      },
      setGameTemplates(state, templates) {
        state.gameTemplates = templates
      },

      setUserRessources(state, ressources) {
        state.userRessources = ressources
      },
      setUserRigs(state, rigs) {
        state.userRigs = rigs
      },
      setUserElecSources(state, elecSources) {
        state.userElecSources = elecSources
      },
      setUserWorkshops(state, workshops) {
        state.userWorkshops = workshops
      },

      setAnimations(state, animations) {
        state.animations = animations
      },
    },
    actions: {
      getWax(vuexContext, wax) {
        vuexContext.commit('setWax', wax)
      },
      async getWaxPrice({ commit }) {
        const myHeaders = new Headers()
        myHeaders.append('pragma', 'no-cache')
        myHeaders.append('cache-control', 'no-cache')

        const response = await fetch(
          'https://api.coingecko.com/api/v3/simple/price?ids=wax&vs_currencies=usd',
          {
            method: 'GET',
            headers: myHeaders,
          }
        )

        if (!response.ok) {
          return `An error has occured: ${response.status}`
        }

        const data = await response.json()

        commit('setWaxPrice', data.wax.usd)
      },
      async getUserAccount({ commit, getters }) {
        const userAccount = await getters.wax.login()
        commit('setUserAccount', userAccount)
      },
      async getUserBalance({ commit, getters }) {
        const data = await this.$axios.$post(
          'https://chain.wax.io/v1/chain/get_account',
          {
            account_name: getters.userAccount,
          }
        )

        commit('setUserCpu', data.cpu_limit)

        const balance =
          Math.floor(
            parseFloat(data.core_liquid_balance.replace(/[^\d.-]/g, '')) * 100
          ) / 100

        commit('setUserBalance', balance)
      },
      async getWithdrawalFee({ commit }) {
        const data = await this.$axios.$post(
          'https://chain.wax.io/v1/chain/get_table_rows',
          {
            json: true,
            code: 'defiminingio',
            scope: 'defiminingio',
            table: 'config',
            lower_bound: '',
            upper_bound: '',
            index_position: 1,
            key_type: '',
            limit: '100',
            reverse: false,
            show_payer: false,
          }
        )

        const fee = data.rows[0].fee

        commit('setWithdrawalFee', fee)
      },

      async getUserRessources({ commit, getters }) {
        const data = await this.$axios.$post(
          'https://chain.wax.io/v1/chain/get_table_rows',
          {
            json: true,
            code: 'defiminingio',
            scope: 'defiminingio',
            table: 'users',
            lower_bound: getters.userAccount,
            upper_bound: getters.userAccount,
            index_position: 1,
            key_type: 'i64',
            limit: '100',
            reverse: false,
            show_payer: false,
          }
        )

        const ressources = data.rows[0]
        ressources.max_energy = 500000

        commit('setUserRessources', ressources)
      },

      async getGameTemplates({ commit }) {
        const templatesData = await this.$axios.$post(
          'https://chain.wax.io/v1/chain/get_table_rows',
          {
            json: true,
            code: 'defiminingio',
            scope: 'defiminingio',
            table: 'templates',
            limit: '300',
            reverse: false,
            show_payer: false,
          }
        )

        const templates = templatesData.rows

        commit('setGameTemplates', templates)
      },

      async getUserRigs({ commit, getters }) {
        const rigsData = await this.$axios.$post(
          'https://chain.wax.io/v1/chain/get_table_rows',
          {
            json: true,
            code: 'defiminingio',
            scope: 'defiminingio',
            table: 'rigs',
            lower_bound: getters.userAccount,
            upper_bound: getters.userAccount,
            index_position: 2,
            key_type: 'i64',
            limit: '100',
            reverse: false,
            show_payer: false,
          }
        )

        const rigs = rigsData.rows

        rigs.forEach((rig) => {
          const rigConf = getters.gameTemplates.find(
            (template) => template.template_id === rig.template_id
          )
          rig.name = rigConf.name
          rig.img_url = 'https://ipfs.atomichub.io/ipfs/' + rigConf.img
          rig.rewards_token = rigConf.claim_type
        })

        commit('setUserRigs', rigs)
      },

      async getUserElecSources({ commit, getters }) {
        const elecSourcesData = await this.$axios.$post(
          'https://chain.wax.io/v1/chain/get_table_rows',
          {
            json: true,
            code: 'defiminingio',
            scope: 'defiminingio',
            table: 'elecsources',
            lower_bound: getters.userAccount,
            upper_bound: getters.userAccount,
            index_position: 2,
            key_type: 'i64',
            limit: '100',
            reverse: false,
            show_payer: false,
          }
        )

        const elecSources = elecSourcesData.rows

        elecSources.forEach((elecSource) => {
          const elecSourceConf = getters.gameTemplates.find(
            (template) => template.template_id === elecSource.template_id
          )
          elecSource.name = elecSourceConf.name
          elecSource.img_url =
            'https://ipfs.atomichub.io/ipfs/' + elecSourceConf.img
          elecSource.rewards_token = elecSourceConf.claim_type
        })

        commit('setUserElecSources', elecSources)
      },

      async getUserWorkshops({ commit, getters }) {
        const workshopsData = await this.$axios.$post(
          'https://chain.wax.io/v1/chain/get_table_rows',
          {
            json: true,
            code: 'defiminingio',
            scope: 'defiminingio',
            table: 'workshops',
            lower_bound: getters.userAccount,
            upper_bound: getters.userAccount,
            index_position: 2,
            key_type: 'i64',
            limit: '100',
            reverse: false,
            show_payer: false,
          }
        )

        const workshops = workshopsData.rows

        workshops.forEach((workshop) => {
          const workshopConf = getters.gameTemplates.find(
            (template) => template.template_id === workshop.template_id
          )
          workshop.name = workshopConf.name
          workshop.img_url =
            'https://ipfs.atomichub.io/ipfs/' + workshopConf.img
          workshop.rewards_token = workshopConf.claim_type
        })

        commit('setUserWorkshops', workshops)
      },

      setAnimations({ commit }, animations) {
        commit('setAnimations', animations)
      },
    },
    getters: {
      wax(state) {
        return state.wax
      },
      userAccount(state) {
        return state.userAccount
      },
      gameTemplates(state) {
        return state.gameTemplates
      },
      userDMT(state) {
        return state.userRessources.balance_dmt / 10000
      },
      userDMC(state) {
        return state.userRessources.balance_dmc / 10000
      },
      userDME(state) {
        return state.userRessources.balance_dme / 10000
      },
    },
  })
}

export default createStore