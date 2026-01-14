<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue';
import { Player } from './Player.ts';
const props = defineProps<{ name: string, src: string }>()
const player = new Player(props.name, props.src)
const wrapper = ref<HTMLDivElement>()
onMounted(() => wrapper.value?.appendChild(player.video))
onUnmounted(() => wrapper.value?.removeChild(player.video))
</script>

<template>
    <div class="wrapper" ref="wrapper">
        <!-- <video autoplay muted></video> -->
    </div>
</template>

<style>
.wrapper {
    width: 100%;
    height: 100%;
    background-color: #000;
}
</style>