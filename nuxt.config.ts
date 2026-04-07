// https://nuxt.com/docs/api/configuration/nuxt-config
import tailwindcss from '@tailwindcss/vite'

export default defineNuxtConfig({

  modules: [
    '@nuxt/eslint',
    '@nuxt/hints',
    '@nuxt/image',
    '@nuxt/test-utils',
    'shadcn-nuxt',
    'nuxt-auth-utils'
  ],
  devtools: { enabled: true },
  css: ['./app/assets/css/main.css'],

  runtimeConfig: {
    submitVerifyOrderApiKey: process.env.SUBMIT_VERIFY_ORDER_API_KEY,
    public: {
    },
  },
  compatibilityDate: '2025-07-15',
  vite: {
    plugins: [
      tailwindcss(),
    ],
  },
  eslint: {
    config: {
      stylistic: true,
    },
  },
  shadcn: {
    /**
     * Prefix for all the imported component.
     * @default "Ui"
     */
    prefix: '',
    /**
     * Directory that the component lives in.
     * Will respect the Nuxt aliases.
     * @link https://nuxt.com/docs/api/nuxt-config#alias
     * @default "@/components/ui"
     */
    componentDir: '@/components/ui',
  },
  routeRules: {
    '/api/external/**': { 
      proxy: 'http://40.83.77.78:8000/api/**' 
    },
  }
})
