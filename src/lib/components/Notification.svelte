<script lang="ts">
  export let fr: string;
  export let en: string;
  export let lang: 'fr' | 'en' = 'fr';

  const message = () => (lang === 'fr' ? fr : en || fr);
</script>

{#if message()}
  <div class="notification">
    <p>{message()}</p>
  </div>
{/if}

<style>
  .notification {
    position: fixed;
    top: 16px;
    right: 16px;
    z-index: 10000;
    max-width: 260px;
    padding: 8px 12px;
    border-radius: 6px;
    background: rgba(222, 53, 11, 0.98);
    color: #fff;
    font-size: 13px;
    line-height: 1.4;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.25);
  }
</style>

