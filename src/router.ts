import { createWebHistory, createRouter } from "vue-router";
import Home from "./pages/Home.vue";
import Screen from "./pages/Screen.vue";
import Editor from "./pages/Editor.vue";

const routes = [
  { path: "/", component: Home },
  {
    name: "DesserteDetails",
    path: "/screen/:line?/:trip?",
    component: Screen,
  },
  {
    name: "Editor",
    path: "/editor",
    component: Editor,
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
