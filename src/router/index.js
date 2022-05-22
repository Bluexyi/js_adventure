import { createRouter, createWebHashHistory } from "vue-router"
import Home from '@/views/Home.vue'
import NotFound from '@/views/NotFound.vue'
import Game from '@/views/Game.vue'

//Liste des routes
const routes = [
    {
        name: 'Home',
        path: '/',
        component: Home,
        meta: {
            title: 'Accueil' //Uniquement utilisé pour changer le titre des pages via afterEach
        }
    }, {
        name: 'game',
        path: '/game/:name/:sexe',
        component: Game,
        meta: {
            title: 'Game'
        },
        props: true // Ne pas oublier pour utiliser les props en parametre
    }, {
        name: 'notFound',
        path: '/:pathMatch(.*)',
        component: NotFound,
        meta: {
            title: '404 Not found'
        }
    }
];

//Declaration du router
const router = createRouter({
    history: createWebHashHistory(),
    routes
})

router.afterEach((to, from) => {
    console.log("from : " + from + " | to : " + to)
    document.title = to.meta.title; // Pour changer le titre des page
})

export default router;