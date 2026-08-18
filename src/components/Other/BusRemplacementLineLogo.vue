<template>
  <div class="replacement-badge">
    <svg
      viewBox="0 0 80 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      :style="style"
      preserveAspectRatio="xMidYMid meet"
    >
      <rect
        x="0"
        y="0"
        width="80"
        height="24"
        rx="12"
        :fill="bgColor"
      />
      <path
        fill-rule="evenodd"
        clip-rule="evenodd"
        d="M16.097 14.6496L16.0857 14.2928L16.0328 13.9415L15.9497 13.613L15.8591 13.3486L15.7326 13.0672L15.5985 12.8407L15.2964 12.4366L14.9338 12.1476L14.5713 11.9041L14.2389 11.7681L13.9009 11.6888V11.6359L14.2389 11.4641L14.5807 11.2167L14.9338 10.9486L15.2152 10.6143L15.4984 10.2575L15.6967 9.82315L15.8327 9.34163L15.8591 8.80347L15.8421 8.42581L15.7855 8.08025L15.7062 7.75168L15.5608 7.44389L15.3965 7.17198L15.2152 6.92083L15.0056 6.69612L14.7714 6.49219L14.5014 6.31658L14.2389 6.15229L13.9387 6.02389L13.629 5.91437L12.9964 5.79352L12.3337 5.7312H8.9687L8.76098 5.75386L8.56271 5.83317L8.39844 5.91437L8.24548 6.05788L8.13596 6.1995L8.05477 6.39022L8.01889 6.57338L8 6.77543V17.3235L8.01889 17.5369L8.10008 17.7181L8.21716 17.8881L8.38144 18.0259L8.56271 18.1203L8.77043 18.1883L8.98003 18.2374L9.20662 18.2676H12.3884L13.0852 18.2072L13.4383 18.1392L13.7744 18.058L14.1011 17.9391L14.3994 17.7937L14.6903 17.6275L14.964 17.4047L15.1888 17.1932L15.4323 16.925L15.6401 16.6305L15.7855 16.3019L15.9233 15.9394L16.0045 15.5409L16.0857 15.1312L16.097 14.6496ZM13.3571 9.3945L13.3193 9.79105L13.2042 10.1309L12.9964 10.401L12.7491 10.6143L12.4413 10.7711L12.0995 10.8768L11.7351 10.9486L11.3631 10.9618H10.4208V7.80267H11.3631L11.7521 7.82344L12.1146 7.88198L12.4507 7.98206L12.7604 8.15011L13.0134 8.35405L13.2042 8.62408L13.3193 8.96586L13.3571 9.3945ZM13.7197 14.3815L13.6838 14.8101L13.6026 15.1746L13.4383 15.4975L13.2136 15.7354L12.9039 15.9394L12.5414 16.0866L12.1146 16.1641L11.6255 16.1811H10.5473V12.6726H11.6255L11.9692 12.6858L12.3337 12.7462L12.6792 12.8539L13.0134 12.9993L13.2835 13.2278L13.4119 13.3543L13.5271 13.5223L13.6101 13.7017L13.6649 13.9132L13.6932 14.1417L13.7197 14.3815Z"
        :fill="textColor"
      />
      <path
        d="M25.8142 6.64514V14.1001L25.7953 14.6308L25.7406 15.1312L25.6518 15.5768L25.514 15.9903L25.3516 16.3907L25.1798 16.7419L24.9418 17.0516L24.7077 17.3367L24.4169 17.5935L24.1091 17.7937L23.7824 17.973L23.4199 18.1392L23.0479 18.2374L22.6589 18.3432L22.2227 18.3753L21.7959 18.3998L21.2993 18.3753L20.8197 18.3432L20.4005 18.2374L20.0039 18.1392L19.6206 17.9938L19.2769 17.8088L18.9672 17.5935L18.7067 17.3367L18.4423 17.0591L18.2346 16.7419L18.0533 16.3907L17.8909 15.9903L17.772 15.5768L17.6908 15.1009L17.6266 14.6175L17.619 14.068V6.64514L17.6643 6.4261L17.7266 6.22783L17.8362 6.05788L17.991 5.93703L18.1817 5.83317L18.3894 5.75386L18.6236 5.69721H19.1051L19.3241 5.75386L19.5319 5.83317L19.7131 5.93703L19.8944 6.05788L20.0209 6.22783L20.0832 6.4261L20.1191 6.64514V13.8018L20.1399 14.3267L20.2381 14.7913L20.357 15.2161L20.5459 15.5598L20.7536 15.8279L21.0444 16.0319L21.3805 16.1338L21.7959 16.1811L22.1868 16.1338L22.5324 16.013L22.7948 15.8147L23.0309 15.5409L23.1933 15.201L23.3028 14.7724L23.3745 14.3267L23.384 13.8018V6.64514L23.4199 6.4261L23.5029 6.22783L23.6087 6.05788L23.7749 5.93703L23.9561 5.83317L24.1544 5.75386L24.364 5.69721H24.8172L25.0344 5.75386L25.2232 5.83317L25.4347 5.93703L25.5763 6.05788L25.6953 6.22783L25.7765 6.4261L25.8142 6.64514Z"
        :fill="textColor"
      />
      <path
        d="M34 14.5628L33.9641 13.9132L33.8187 13.3259L33.611 12.801L33.3372 12.3327L32.9935 11.9041L32.5951 11.5264L32.14 11.1959L31.6793 10.9051L30.7106 10.384L30.2838 10.1026L30.1177 9.94589L29.9458 9.7665L29.7948 9.589L29.7022 9.3945L29.6305 9.16224L29.6135 8.93753L29.6569 8.67506L29.7287 8.43902L29.8476 8.23509L30.01 8.05759L30.2366 7.91219L30.4651 7.80267L30.7559 7.73091L31.0448 7.71392L31.4716 7.75168L31.8681 7.85932L32.5875 8.13123L32.8028 8.20865L32.9935 8.23509L33.1918 8.20865L33.3561 8.11235L33.4826 7.98206L33.611 7.80267L33.7111 7.6044L33.7829 7.35703L33.8357 7.09644L33.8546 6.87929L33.8187 6.68479L33.7545 6.51862L33.6469 6.39022L33.5109 6.2637L33.1559 6.05788L32.7216 5.85961L32.2231 5.7312L31.6528 5.64812L31.0977 5.61035L30.7106 5.62357L30.3178 5.66322L29.9572 5.75386L29.6022 5.85961L29.266 5.99179L28.9507 6.17306L28.6523 6.35056L28.388 6.58471L28.1349 6.82642L27.9008 7.11155L27.7176 7.39668L27.5628 7.73091L27.4268 8.08025L27.3286 8.43902L27.2625 8.84501L27.2569 9.25477L27.289 9.87224L27.4268 10.4368L27.6081 10.9278L27.8706 11.3848L28.2067 11.7813L28.607 12.1609L29.0508 12.4875L29.5946 12.8237L30.5897 13.3939L31.0259 13.6923L31.2091 13.8509L31.3526 14.0322L31.4716 14.2323L31.5603 14.4533L31.617 14.6855L31.6434 14.9197L31.5962 15.2293L31.498 15.4975L31.3337 15.7052L31.1355 15.8884L30.8805 16.013L30.6105 16.1112L30.3178 16.1773L30.01 16.1811L29.5304 16.1338L29.0413 16.0319L28.5881 15.8884L28.2237 15.7354L27.999 15.6599L27.7724 15.6372L27.6006 15.6693L27.4457 15.7581L27.289 15.8884L27.1832 16.0621L27.0756 16.2868L26.9925 16.5342L26.9113 16.8136V17.0516L26.9472 17.2404L27.0378 17.4047L27.1474 17.5538L27.3098 17.686L27.6931 17.8937L28.1538 18.0863L28.7335 18.2374L29.3661 18.3564L30.01 18.3998L30.4179 18.3753L30.8182 18.3167L31.2091 18.2374L31.5603 18.1203L31.9153 17.973L32.2514 17.7937L32.5573 17.5935L32.8198 17.3556L33.1125 17.1025L33.3202 16.8136L33.5109 16.4813L33.7111 16.1641L33.8187 15.7921L33.9282 15.3917L33.9811 14.9933L34 14.5628Z"
        :fill="textColor"
      />
      <g transform="translate(38, 4)">
        <text
          v-if="replacedLine.mode === Mode.TER"
          x="0"
          y="10"
          font-family="ParisineBold"
          font-size="9"
          :fill="textColor"
        >
          SNCF
        </text>
        <MetroModeLogo
          v-else-if="replacedLine.mode === Mode.METRO"
          :color="textColor"
          stroke-width="18"
          height="16"
        />

        <!-- RER -->
        <RerModeLogo
          v-else-if="replacedLine.mode === Mode.RER"
          :color="textColor"
          stroke-width="18"
          height="16"
        />

        <TransilienModeLogo
          v-else-if="replacedLine.mode === Mode.TRANSILIEN"
          :color="textColor"
          stroke-width="18"
          height="16"
        />

        <TramModeLogo
          v-else-if="replacedLine.mode === Mode.TRAM"
          :color="textColor"
          stroke-width="18"
          height="16"
        />
        <CableModeLogo
          v-else-if="replacedLine.mode === Mode.CABLE"
          :color="textColor"
          stroke-width="18"
          height="16"
        />
        <g
          v-if="replacedLine.mode === Mode.TER"
          transform="translate(22, 0)"
        >
          <TerModeLogo
            :color="textColor"
            stroke-width="18"
            height="16"
          />
        </g>
      </g>
      <foreignObject
        v-if="replaceLineOverride.mode !== Mode.TER"
        x="56"
        y="4"
        width="24"
        height="16"
      >
        <LineLogo
          :line="replaceLineOverride"
          class-name="replacedLineLogo"
          :transparent="true"
          size="16px"
        />
      </foreignObject>
    </svg>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { Line, Mode } from "../../types";

import MetroModeLogo from "./Modes/MetroModeLogo.vue";
import RerModeLogo from "./Modes/RerModeLogo.vue";
import TransilienModeLogo from "./Modes/TransilienModeLogo.vue";
import TramModeLogo from "./Modes/TramModeLogo.vue";
import CableModeLogo from "./Modes/CableModeLogo.vue";
import TerModeLogo from "./Modes/TerModeLogo.vue";
import LineLogo from "./LineLogo.vue";

interface Props {
  lineName: string;
  height: string;
  baseFontSize?: string;
  bgColor: string;
  textColor: string;
  replacedLine: Line;
}

const props = withDefaults(defineProps<Props>(), {
  baseFontSize: "1400",
});

const replaceLineOverride = computed(() => {
  if ([Mode.TRAM, Mode.CABLE].includes(props.replacedLine.mode)) {
    return {
      ...props.replacedLine,
      textColor: props.textColor,
      color: props.textColor,
    };
  }

  return {
    ...props.replacedLine,
    textColor: props.bgColor,
    color: props.textColor,
  };
});

const style = computed(() => ({
  "--height": props.height,
}));
</script>

<style scoped>
.replacement-badge {
  height: 100%;
  width: fit-content;
  min-height: 0;
  min-width: 0;
}

svg {
  display: block;
  height: var(--height);
  width: auto;
  max-height: 100%;
  max-width: 100%;
  min-height: 0;
  min-width: 0;
  font-family: "ParisineBold";
}
</style>