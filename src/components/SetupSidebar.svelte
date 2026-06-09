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
    background-color: #ffffff;
    border: 1px solid #e0e0e0;
    border-radius: 18px;
    box-shadow: 0 12px 32px rgba(0, 0, 0, 0.1);
    z-index: 2147483647;
    display: flex;
    flex-direction: column;
    pointer-events: auto;
    font-family: "SF Pro Text", system-ui, -apple-system, sans-serif;
    animation: slideInRight 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
    overflow: hidden;
  }

  .sidebar-header {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 16px;
    background: #f5f5f7;
    border-bottom: 1px solid #e0e0e0;
    color: #1d1d1f;
  }

  .sidebar-header h3 {
    margin: 0;
    font-size: 14px;
    font-weight: 600;
    letter-spacing: -0.224px;
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
    background: #f5f5f7;
  }

  .mask-name {
    color: #1d1d1f;
    font-size: 14px;
    letter-spacing: -0.224px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    max-width: 200px;
  }

  .undo-btn {
    background: transparent;
    border: none;
    color: #7a7a7a;
    cursor: pointer;
    padding: 6px;
    border-radius: 6px;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s;
  }

  .undo-btn:hover {
    background: #e8e8ed;
    color: #1d1d1f;
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
    background: #e0e0e0;
    border-radius: 3px;
  }
  .mask-list::-webkit-scrollbar-thumb:hover {
    background: #cccccc;
  }
</style>
