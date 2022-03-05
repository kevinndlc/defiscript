<template>
  <carousel-3d
    :key="enableAnimations && slides.length"
    :width="250"
    height="310"
    :autoplay="enableAnimations"
    :autoplayTimeout="5000"
    :controls-visible="slides.length > 1 ? true : false"
    :display="numberOfSlides"
  >
    <slide v-for="(slide, i) in slides" :key="i" :index="i">
      <template slot-scope="{ index, isCurrent, leftIndex, rightIndex }">
        <div class="bg-gray-800 rounded-xl overflow-hidden">
          <div class="bg-gray-200 text-secondary font-medium text-center p-2">
            {{ slide.name }}
          </div>
          <img
            :data-index="index"
            :class="[
              {
                current: isCurrent,
                onLeft: leftIndex >= 0,
                onRight: rightIndex >= 0,
              },
              'cursor-pointer mb-2 h-44 object-cover',
            ]"
            :src="slide.img_url"
            referrerpolicy="no-referrer"
          />
          <div
            v-if="slide.current_durability >= 0"
            v-show="isCurrent"
            class="
              font-medium
              text-gray-200
              cursor-pointer
              pl-4
            "
          >
            Durability: {{ slide.current_durability }}/{{ slide.durability }}
          </div>
          <Counter
            v-show="isCurrent"
            class="p-4 pt-0"
            :timestamp="slide.claim_time"
            :autoclaim="autoclaim"
            :waitingSeconds="i"
            @claimed="handleClaim(slide)"
          />
        </div>
      </template>
    </slide>
  </carousel-3d>
</template>

<script>
import { Carousel3d, Slide } from 'vue-carousel-3d'

export default {
  components: {
    Carousel3d,
    Slide,
  },
  props: {
    slides: {
      type: Array,
      required: true,
    },
    autoclaim: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      windowWidth: window.innerWidth,
    }
  },
  computed: {
    numberOfSlides() {
      return this.windowWidth >= 1050 ||
        (this.windowWidth < 768 && this.windowWidth > 550)
        ? 5
        : 3
    },
    enableAnimations() {
      return this.$store.state.animations
    },
  },
  mounted() {
    window.addEventListener('resize', () => {
      this.windowWidth = window.innerWidth
    })
  },
  methods: {
    handleClaim(asset) {
      this.$emit('claimAsset', asset, 1)
    },
  },
}
</script>

<style>
.carousel-3d-slide {
  border: none;
  background: transparent;
}

.next,
.prev {
  color: rgb(220, 223, 226) !important;
}

.next:hover,
.prev:hover {
  color: #d87226 !important;
}
</style>
