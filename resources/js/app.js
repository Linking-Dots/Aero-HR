import { createInertiaApp } from '@inertiajs/vue3'
import { createPinia } from 'pinia'
import csrf from './plugins/csrf'

createInertiaApp({
    resolve: (name) => {
        const pages = import.meta.glob('./Pages/**/*.vue', { eager: true })
        return pages[`./Pages/${name}.vue`]
    },
    setup({ el, App, props, plugin }) {
        const app = createApp({ render: () => h(App, props) })
        app.use(plugin)
        app.use(createPinia())
        
        // Initialize CSRF plugin
        csrf(app)
        
        app.mount(el)
    },
})
