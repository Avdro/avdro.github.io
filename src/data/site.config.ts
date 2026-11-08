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
    description: 'Free and open-source software, done right. GetFOSS picks the best FOSS apps — private, secure, and community-driven — for every platform.',
    lang: 'en',
    ogLocale: 'en_US',
    shareMessage: 'Share this post',
    paginationSize: 6
}
