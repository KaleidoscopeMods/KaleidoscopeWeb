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
                "简介",
            ],
        },
        {
            text: '厨房',
            collapsed: false,
            icon: 'mdi:cook',
            items: [
                "简介",
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
            text: '厨房',
            collapsed: false,
            icon: 'mdi:cook',
            items: [
                "Introduction",
            ],
        },
    ],
})

export const enNotes = defineNotesConfig({
    dir: 'en/notes',
    link: '/en/',
    notes: [enNote],
})