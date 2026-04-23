import { defineClientConfig } from 'vuepress/client'
import HomeLayout from './layouts/HomeLayout.vue'
import FoodPoints from './theme/components/FoodPoints.vue'
import ItemAnimate from './theme/components/ItemAnimate.vue'
// import RepoCard from 'vuepress-theme-plume/features/RepoCard.vue'
// import NpmBadge from 'vuepress-theme-plume/features/NpmBadge.vue'
// import NpmBadgeGroup from 'vuepress-theme-plume/features/NpmBadgeGroup.vue'
// import Swiper from 'vuepress-theme-plume/features/Swiper.vue'

// import CustomComponent from './theme/components/Custom.vue'

import './theme/styles/custom.css'

export default defineClientConfig({
  enhance({ app }) {
    // built-in components
    // app.component('RepoCard', RepoCard)
    // app.component('NpmBadge', NpmBadge)
    // app.component('NpmBadgeGroup', NpmBadgeGroup)
    // app.component('Swiper', Swiper) // you should install `swiper`

    // your custom components
    app.component('FoodPoints', FoodPoints)
    app.component('ItemAnimate', ItemAnimate)
    // app.component('CustomComponent', CustomComponent)
  },
  layouts: {
    HomeLayout,
  },
})
