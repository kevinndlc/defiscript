<template>
  <div>
    <DisabledButton v-if="!readyToClaim" class="block w-full mt-2" disabled>
      {{ remainingTime }}
    </DisabledButton>
    <PrimaryButton v-else class="block w-full mt-2" @click='handleClaim'>
      CLAIM
    </PrimaryButton>
  </div>
</template>

<script>
export default {
  props: {
    timestamp: {
      type: Number,
      required: true
    },
    autoclaim: {
      type: Boolean,
      default: false
    },
    waitingSeconds: {
      type: Number,
      default: 1
    }
  },
  data() {
    return {
      loaded: false,
      readyToClaim: false,
      displayHours: 0,
      displayMinutes: 0,
      displaySeconds: 0
    }
  },
  computed: {
    _seconds() {
      return 1000
    },
    _minutes() {
      return this._seconds * 60
    },
    _hours() {
      return this._minutes * 60
    },
    remainingTime() {
      if (this.loaded) {
        return this.displayHours + ':' + this.displayMinutes + ':' + this.displaySeconds
      } else {
        return 'Getting remaining time...'
      }
    }
  },
  watch: {
    // eslint-disable-next-line object-shorthand
    timestamp: function() {
      this.loaded = false
      this.readyToClaim = false
      this.showRemaining()
    },
    // eslint-disable-next-line object-shorthand
    autoclaim: function() {
      if (this.autoclaim) {
        this.loaded = false
        this.readyToClaim = false
        this.showRemaining()
      }
    }
  },
  mounted() {
    this.showRemaining()
  },
  methods: {
    showRemaining() {
      const timer = setInterval(() => {
        const now = new Date()
        const end = new Date(this.timestamp * 1000)
        const distance = end.getTime() - now.getTime()

        if (distance <= 0) {
        clearInterval(timer)
        this.readyToClaim = true
        this.loaded = true
        if (this.autoclaim) {
          this.handleClaim()
        }
        return null
      }

      const hours = Math.floor(distance / this._hours)
      const minutes = Math.floor((distance % this._hours) / this._minutes)
      const seconds = Math.floor((distance % this._minutes) / this._seconds)
      this.displayHours = hours < 10 ? '0' + hours : hours
      this.displayMinutes = minutes < 10 ? '0' + minutes : minutes
      this.displaySeconds = seconds < 10 ? '0' + seconds : seconds

      this.loaded = true
      }, 1000)
    },
    handleClaim() {
      // if (this.autoclaim) {
      //   setTimeout(() => {
      //     this.$emit('claimed')
      //   }, this.waitingSeconds * 1000)
      // } else {
      //   this.$emit('claimed')
      // }
      this.$emit('claimed')
    }
  },
}
</script>