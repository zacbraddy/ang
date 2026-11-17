<script setup>
defineProps({ stage: String, command: String });
</script>

<template>
  <div class="stage-card">
    <p class="stage-card__head"><span class="stage-card__stage">{{ stage }}</span> <code>{{ command }}</code></p>
    <slot />
  </div>
</template>

<style scoped>
.stage-card { border: 1px solid var(--vp-c-divider); border-left: 4px solid var(--vp-c-brand-1); border-radius: 8px; padding: 0.75rem 1rem; }
.stage-card__stage { font-weight: 600; color: var(--vp-c-text-1); }
</style>
