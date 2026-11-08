interface SiteConfig {
    site: string
    author: string
    title: string
    description: string
    lang: string
    ogLocale: string
    shareMessage: string
    paginationSize: number
}

export const siteConfig: SiteConfig = {
    site: 'https://www.getfoss.org/',
    author: 'Avdro',
    title: 'GetFOSS',
    description: 'GetFOSS is a curated guide to the best free and open-source software. Quality FOSS apps for every platform — private, secure, and community-driven.',
    lang: 'en',
    ogLocale: 'en_US',
    shareMessage: 'Share this post',
    paginationSize: 6
}
