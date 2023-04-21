import type { Route } from "../index.type";
import Layout from "@/layout/index.vue";
import { createNameComponent } from "../createNode";
const route: Route[] = [
  {
    path: "/",
    component: Layout,
    redirect: "/dashboard",
    meta: { title: "message.menu.dashboard.name", icon: "sfont system-home" },
    children: [
      {
        path: "dashboard",
        component: createNameComponent(
          () => import("@/views/main/dashboard/NewsDashboard.vue")
        ),
        meta: {
          title: "message.menu.newsList.index",
          icon: "sfont system-home",
          hideClose: true,
        },
      },
    ],
  },
];

export default route;
