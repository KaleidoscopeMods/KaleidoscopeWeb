import {defineNoteConfig, defineNotesConfig} from 'vuepress-theme-plume'

/* =================== locale: zh-CN ======================= */

const zhNote = defineNoteConfig({
    dir: 'wiki',
    link: '/wiki/',
    sidebar: [
        {
            text: '新手入门',
            collapsed: false,
            icon: 'carbon:idea',
            items: [
                '简介',
            ],
        },
        {
            text: '厨房',
            collapsed: false,
            icon: 'mdi:cook',
            prefix: '厨房',
            items: [
                '厨房简介',
                '进度',
                '作物种植',
                '原料',
                '烹饪',
                '食谱',
                '杂项',
            ],
        },
        {
            text: '酒馆',
            collapsed: false,
            icon: 'game-icons:tavern-sign',
            prefix: '酒馆',
            items: [
                '酒馆简介',
            ],
        },
        {
            text: '玩偶',
            collapsed: false,
            icon: 'mdi:child-toy',
            prefix: '玩偶',
            items: [
                '玩偶简介',
            ],
        },
    ],
})

export const zhNotes = defineNotesConfig({
    dir: 'notes',
    link: '/',
    notes: [zhNote],
})

/* =================== locale: en-US ======================= */

const enNote = defineNoteConfig({
    dir: 'wiki',
    link: '/wiki/',
    sidebar: [
        {
            text: 'Getting Started',
            collapsed: false,
            icon: 'carbon:idea',
            items: [
                "Introduction",
            ],
        },
        {
            text: 'Cookery',
            collapsed: false,
            icon: 'mdi:cook',
            prefix: 'Cookery',
            items: [
                "Cookery Introduction",
                'Advancements',
                'Crop Cultivation',
                'Ingredients',
                'Cooking',
                'Cookbook',
                'Miscellaneous',
            ],
        },
        {
            text: 'Tavern',
            collapsed: false,
            icon: 'game-icons:tavern-sign',
            prefix: 'Tavern',
            items: [
                "Tavern Introduction",
            ],
        },
        {
            text: 'Doll',
            collapsed: false,
            icon: 'mdi:child-toy',
            prefix: 'Doll',
            items: [
                'Doll Introduction',
            ],
        },
    ],
})

export const enNotes = defineNotesConfig({
    dir: 'en/notes',
    link: '/en/',
    notes: [enNote],
})