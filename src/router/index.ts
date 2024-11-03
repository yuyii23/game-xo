import { createRouter, createWebHistory } from 'vue-router';

export const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/:catchAll(.*)',
      redirect: '/',
    },
    {
      name: 'Login',
      path: '/',
      component: () => import('@/views/Login.vue'),
    },
    {
      name: 'PlayGame',
      path: '/play-game',
      component: () => import('@/views/PlayGame.vue'),
      meta: { requiresAuth: true }  
    },
  ],
  scrollBehavior(to, from, savedPosition) {
    console.log('scrollBehavior', { to, from, savedPosition });
    
    if (savedPosition) {
      return savedPosition;
    } else {
      return { left: 0, top: 0, behavior: 'smooth' };
    }
  },
});

const isAuthenticated = () => {
  return !!localStorage.getItem('userId');
};

router.beforeEach((to, from, next) => {
  if (to.meta.requiresAuth && !isAuthenticated()) {
    next('/');
  } else {
    next();
  }
});


export default router;
