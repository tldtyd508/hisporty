import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
    return createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
}

export function getURL() {
    // 1. If we're in the browser, window.location.origin is the most reliable.
    if (typeof window !== 'undefined') {
        return `${window.location.origin}/`
    }

    // 2. Fallback for server-side or non-browser environments.
    let url =
        process.env.NEXT_PUBLIC_SITE_URL ??
        process.env.NEXT_PUBLIC_VERCEL_URL ??
        'http://localhost:3000/'

    // Ensure the protocol is present.
    url = url.includes('http') ? url : `https://${url}`
    // Ensure trailing slash.
    url = url.endsWith('/') ? url : `${url}/`

    return url
}


