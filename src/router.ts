import { createWebHistory, createRouter } from "vue-router";
import Home from "./pages/Home.vue";
import Screen from "./pages/Screen.vue";

const routes = [
  { path: "/", component: Home },
  {
    name: "DesserteDetails",
    path: "/screen/:lineRef?/:tripRef?",
    component: Screen,
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
