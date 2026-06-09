<script lang="ts">
  import { Trash2, EyeOff } from '@lucide/svelte';
  import { onDestroy } from 'svelte';

  type MaskData = {
    id: string;
    name: string;
  };

  let masks: MaskData[] = $state([]);

  function handleUpdate(e: CustomEvent) {
    masks = e.detail.masks;
  }

  window.addEventListener('FIXTHEFLOW_MASKS_UPDATED', handleUpdate as any);

  onDestroy(() => {
    window.removeEventListener('FIXTHEFLOW_MASKS_UPDATED', handleUpdate as any);
  });

  function undoMask(id: string) {
    window.dispatchEvent(new CustomEvent('FIXTHEFLOW_UNDO_MASK', { detail: { id } }));
  }
</script>

{#if masks.length > 0}
<div class="sidebar-container">
  <div class="sidebar-header">
    <EyeOff size={16} />
    <h3>Hidden Elements ({masks.length})</h3>
  </div>
  
  <ul class="mask-list">
    {#each masks as mask (mask.id)}
      <li class="mask-item">
        <span class="mask-name" title={mask.name}>{mask.name}</span>
        <button class="undo-btn" onclick={() => undoMask(mask.id)} title="Undo Blur">
          <Trash2 size={14} />
        </button>
      </li>
    {/each}
  </ul>
</div>
{/if}

<style>
  .sidebar-container {
    position: fixed;
    top: 24px;
    right: 24px;
    width: 280px;
    max-height: calc(100vh - 48px);
    background-color: #121215;
    border: 1px solid #2A2A32;
    border-radius: 16px;
    box-shadow: 0 12px 32px rgba(0, 0, 0, 0.4);
    z-index: 2147483647;
    display: flex;
    flex-direction: column;
    pointer-events: auto;
    font-family: Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    animation: slideInRight 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
    overflow: hidden;
  }

  .sidebar-header {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 16px;
    background: #1C1C21;
    border-bottom: 1px solid #2A2A32;
    color: #F5F5F7;
  }

  .sidebar-header h3 {
    margin: 0;
    font-size: 14px;
    font-weight: 600;
  }

  .mask-list {
    list-style: none;
    margin: 0;
    padding: 8px;
    overflow-y: auto;
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  .mask-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 8px 12px;
    background: transparent;
    border-radius: 8px;
    transition: background 0.2s;
  }

  .mask-item:hover {
    background: #2A2A32;
  }

  .mask-name {
    color: #E5E5EA;
    font-size: 13px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    max-width: 200px;
  }

  .undo-btn {
    background: transparent;
    border: none;
    color: #8E8E93;
    cursor: pointer;
    padding: 6px;
    border-radius: 6px;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s;
  }

  .undo-btn:hover {
    background: rgba(255, 59, 48, 0.15);
    color: #FF3B30;
  }

  @keyframes slideInRight {
    from { opacity: 0; transform: translateX(20px); }
    to { opacity: 1; transform: translateX(0); }
  }

  .mask-list::-webkit-scrollbar {
    width: 6px;
  }
  .mask-list::-webkit-scrollbar-track {
    background: transparent;
  }
  .mask-list::-webkit-scrollbar-thumb {
    background: #2A2A32;
    border-radius: 3px;
  }
  .mask-list::-webkit-scrollbar-thumb:hover {
    background: #3A3A42;
  }
</style>
