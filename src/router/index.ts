import { createRouter, createWebHistory } from 'vue-router'
import Home from '../views/Home.vue'
import AdminEbook from '../views/admin/about-ebook.vue'
import AdminCategory from '../views/admin/about-category.vue'
import AdminDoc from '../views/admin/about-doc.vue'
import Doc from '../views/doc.vue'


const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home
  },
  {
    path: '/doc',
    name: 'Doc',
    component: Doc,
  },
  {
    path: '/admin/ebook',
    name: 'AdminEbook',
    component: AdminEbook,
  },
  {
    path: '/admin/category',
    name: 'AdminCategory',
    component: AdminCategory,
  },
  {
    path: '/admin/doc',
    name: 'AdminDoc',
    component: AdminDoc,
  },
  {
    path: '/about',
    name: 'About',
    // route level code-splitting
    // this generates a separate chunk (about.[hash].js) for this route
    // which is lazy-loaded when the route is visited.
    component: () => import(/* webpackChunkName: "about" */ '../views/About.vue')
  }
]

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes
})

export default router
