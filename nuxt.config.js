import {defineNuxtConfig} from 'nuxt'

export default defineNuxtConfig({

    //vite: false,

    /*vue: {
        compilerOptions: {
            isCustomElement: tag => tag.startsWith('vue3-'),
        }
    },*/

    meta: {
        title: 'Testing system',
        meta: [
            {
                name: 'keywords',
                content: 'Testing system'
            },
            {
                hid: 'description',
                name: 'description',
                content: 'Testing system'
            }
        ],
        link: [
            {
                rel: 'stylesheet',
                href: 'https://use.fontawesome.com/releases/v5.2.0/css/all.css'
            },
            {rel: 'icon', type: "image/x-icon", href: '/favicon.png'},
        ],
       /* script: [
            {
                defer: true,
                async: true,
                src: 'https://platform.twitter.com/widgets.js',
            },
           /!* {
                src: '@/node_modules/@ckeditor/ckeditor5-vue/dist/ckeditor.js',
            }*!/

        ]*/
    },

    css: ["@/assets/scss/main.scss"],

    vite: {
        css: {
            preprocessorOptions: {
                scss: {
                    additionalData: '@import "@/assets/scss/table.scss";',
                },
            },
        },
    },

    buildModules: [
        '~/modules/errorPage',
        // '@intlify/nuxt3'
        //'~/modules/vuei18n',
    ],

    /*build: {
        transpile: ['vue-universal-modal']
    },*/

    /*vue: {
        compilerOptions: {
            isCustomElement: tag => ['table-body', 'table-body'].includes(tag)
        }
    }*/


})
