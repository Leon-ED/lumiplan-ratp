<template>
  <svg
    width="2721"
    height="1746"
    viewBox="0 0 2721 1746"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    :style="style"
  >
    <g clip-path="url(#clip0_30_53)">
      <path d="M2721 0H0V1746H2721V0Z" :fill="bgColor" />
      <path d="M2721 0H0V1558.93H2721V0Z" fill="#0A0082" />
      <text
        fill="white"
        xml:space="preserve"
        style="white-space: pre"
        letter-spacing="0em"
        :font-size="getFontSize(realLineName.length)"
      >
        <tspan :x="textXPosition" y="1300">{{ realLineName }}</tspan>
      </text>
      <path
        fill-rule="evenodd"
        clip-rule="evenodd"
        d="M778.682 877.716V193.126H639.14V655.748H637.213C635.195 647.29 628.8 633.639 618.052 614.773C607.282 595.908 592.656 573.028 574.131 546.158L331.576 193.126H193.032V877.716H333.527V432.691H335.477C338.288 440.854 344.524 454.323 354.138 473.053C363.752 491.782 377.267 513.233 394.636 537.405L641.068 877.716H778.682Z"
        fill="white"
      />
    </g>
  </svg>
</template>

<script setup lang="ts">
import { computed } from "vue";

interface Props {
  lineName: string;
  height: string;
  baseFontSize?: string;
  bgColor: string;
  textColor: string;
}

const props = withDefaults(defineProps<Props>(), {
  baseFontSize: "7800",
});

const textXPosition = computed(() => {
  if (realLineName.value.length <= 2) {
    return "1100";
  } else if (realLineName.value.length === 3) {
    return "900";
  }
  return "800";
});

const getFontSize = (length: number): number => {
  if (length <= 2) {
    return 1200;
  }
  if (length <= 3){
    return 950;
  }
  return 800;
};

const realLineName = computed(() => {
  return props.lineName.replace("N", "");
});

const style = computed(() => ({
  "--height": props.height,
}));
</script>

<style scoped>
svg {
  display: block;
  height: var(--height);
  width: auto;
  font-family: "ParisineBold";
}
</style>
