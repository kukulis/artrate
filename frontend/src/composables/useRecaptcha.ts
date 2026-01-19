import { ref, onMounted, onUnmounted, type Ref } from 'vue'

declare global {
    interface Window {
        grecaptcha: {
            render: (container: string | HTMLElement, options: {
                sitekey: string
                callback?: (token: string) => void
                'expired-callback'?: () => void
            }) => number
            reset: (widgetId?: number) => void
        }
        onRecaptchaLoaded?: () => void
    }
}

const RECAPTCHA_SITE_KEY = import.meta.env.VITE_RECAPTCHA_SITE_KEY as string

let scriptLoadPromise: Promise<void> | null = null

const loadRecaptchaScript = (): Promise<void> => {
    if (scriptLoadPromise) {
        return scriptLoadPromise
    }

    if (window.grecaptcha) {
        return Promise.resolve()
    }

    scriptLoadPromise = new Promise<void>((resolve) => {
        window.onRecaptchaLoaded = () => {
            resolve()
        }

        const script = document.createElement('script')
        script.src = 'https://www.google.com/recaptcha/api.js?onload=onRecaptchaLoaded&render=explicit'
        script.async = true
        script.defer = true
        document.head.appendChild(script)
    })

    return scriptLoadPromise
}

export function useRecaptcha(container: Ref<HTMLElement | null>) {
    const token = ref<string | null>(null)
    const widgetId = ref<number | null>(null)

    const onSuccess = (responseToken: string) => {
        token.value = responseToken
    }

    const onExpired = () => {
        token.value = null
    }

    const render = async () => {
        await loadRecaptchaScript()

        if (container.value && widgetId.value === null) {
            widgetId.value = window.grecaptcha.render(container.value, {
                sitekey: RECAPTCHA_SITE_KEY,
                callback: onSuccess,
                'expired-callback': onExpired
            })
        }
    }

    const reset = () => {
        token.value = null
        if (widgetId.value !== null && window.grecaptcha) {
            window.grecaptcha.reset(widgetId.value)
        }
    }

    onMounted(() => {
        render()
    })

    onUnmounted(() => {
        // Widget cleanup is handled by grecaptcha internally
        widgetId.value = null
    })

    return {
        token,
        reset,
        render
    }
}
