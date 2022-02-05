<template>
  <div class="flex flex-col max-w-7xl px-4 mx-auto h-full gap-4">
    <WithdrawalAlert />
    <div v-if="userWorkshops.length > 0 || userElecSources.length > 0" class="flex flex-col md:flex-row gap-4">
      <WorkshopsCard />
      <ElecSourcesCard />
    </div>
    <div v-if="userRigs.length > 0">
      <RigsCard />
    </div>
  </div>
</template>

<script>
export default {
    computed: {
        userRigs() {
            return this.$store.state.userRigs;
        },
        userElecSources() {
            return this.$store.state.userElecSources;
        },
        userWorkshops() {
            return this.$store.state.userWorkshops;
        }
    },
    async mounted() {
        await this.$store.dispatch("getGameTemplates");
        this.$store.dispatch("getUserRessources")
        this.$store.dispatch("getUserRigs");
        this.$store.dispatch("getUserElecSources");
        this.$store.dispatch("getUserWorkshops");
        setInterval(() => {
            this.$store.dispatch("getUserRigs");
            this.$store.dispatch("getUserElecSources");
            this.$store.dispatch("getUserWorkshops");
        }, 60000);
    }
}
</script>