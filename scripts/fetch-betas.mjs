// Fetches the latest BETA / release-candidate version of every tracked project
// from the GitHub API and writes public/data/betas.json for the Beta Radar page.
// Runs inside GitHub Actions — the built-in GITHUB_TOKEN is plenty for ~110 repos.
// A beta = a GitHub release marked as prerelease, or a tag that clearly says
// beta / alpha / rc / preview / canary / nightly. Stable version is taken from
// the same response for comparison. Betas older than 365 days are dropped,
// results are sorted newest first and capped at 100.

const PROJECTS = [
    // Media & Video (16)
    { repo: 'obsproject/obs-studio', name: 'OBS Studio', cat: 'Media & Video' },
    { repo: 'qbittorrent/qBittorrent', name: 'qBittorrent', cat: 'Media & Video' },
    { repo: 'jellyfin/jellyfin', name: 'Jellyfin', cat: 'Media & Video' },
    { repo: 'mltframework/shotcut', name: 'Shotcut', cat: 'Media & Video' },
    { repo: 'koreader/koreader', name: 'KOReader', cat: 'Media & Video' },
    { repo: 'KRTirtho/spotube', name: 'Spotube', cat: 'Media & Video' },
    { repo: 'StrawberryMusicPlayer/Strawberry', name: 'Strawberry', cat: 'Media & Video' },
    { repo: 'transmission/transmission', name: 'Transmission', cat: 'Media & Video' },
    { repo: 'HandBrake/HandBrake', name: 'HandBrake', cat: 'Media & Video' },
    { repo: 'audacity/audacity', name: 'Audacity', cat: 'Media & Video' },
    { repo: 'streamlink/streamlink', name: 'Streamlink', cat: 'Media & Video' },
    { repo: 'LibreTube/LibreTube', name: 'LibreTube', cat: 'Media & Video' },
    { repo: 'recloudstream/cloudstream', name: 'CloudStream', cat: 'Media & Video' },
    { repo: 'aniyomiorg/aniyomi', name: 'Aniyomi', cat: 'Media & Video' },
    { repo: 'jellyfin/jellyfin-androidtv', name: 'Jellyfin Android TV', cat: 'Media & Video' },
    { repo: 'jellyfin/jellyfin-android', name: 'Jellyfin Android', cat: 'Media & Video' },
    // Graphics (7)
    { repo: 'darktable-org/darktable', name: 'darktable', cat: 'Graphics' },
    { repo: 'RawTherapee/RawTherapee', name: 'RawTherapee', cat: 'Graphics' },
    { repo: 'godotengine/godot', name: 'Godot Engine', cat: 'Graphics' },
    { repo: 'excalidraw/excalidraw', name: 'Excalidraw', cat: 'Graphics' },
    { repo: 'FreeCAD/FreeCAD', name: 'FreeCAD', cat: 'Graphics' },
    { repo: 'inkscape/inkscape', name: 'Inkscape', cat: 'Graphics' },
    { repo: 'ImageMagick/ImageMagick', name: 'ImageMagick', cat: 'Graphics' },
    // Notes & Productivity (10)
    { repo: 'appflowy-io/appflowy', name: 'AppFlowy', cat: 'Notes & Productivity' },
    { repo: 'logseq/logseq', name: 'Logseq', cat: 'Notes & Productivity' },
    { repo: 'siyuan-note/siyuan', name: 'SiYuan', cat: 'Notes & Productivity' },
    { repo: 'ankitects/anki', name: 'Anki', cat: 'Notes & Productivity' },
    { repo: 'toeverything/AFFiNE', name: 'AFFiNE', cat: 'Notes & Productivity' },
    { repo: 'nocodb/nocodb', name: 'NocoDB', cat: 'Notes & Productivity' },
    { repo: 'johannesjo/super-productivity', name: 'Super Productivity', cat: 'Notes & Productivity' },
    { repo: 'go-vikunja/vikunja', name: 'Vikunja', cat: 'Notes & Productivity' },
    { repo: 'pbek/QOwnNotes', name: 'QOwnNotes', cat: 'Notes & Productivity' },
    { repo: 'xournalpp/xournalpp', name: 'Xournal++', cat: 'Notes & Productivity' },
    // Security & Privacy (11)
    { repo: 'brave/brave-browser', name: 'Brave', cat: 'Security & Privacy' },
    { repo: 'tailscale/tailscale', name: 'Tailscale', cat: 'Security & Privacy' },
    { repo: 'signalapp/Signal-Desktop', name: 'Signal Desktop', cat: 'Security & Privacy' },
    { repo: 'signalapp/Signal-Android', name: 'Signal Android', cat: 'Security & Privacy' },
    { repo: 'bitwarden/clients', name: 'Bitwarden', cat: 'Security & Privacy' },
    { repo: 'keepassxreboot/keepassxc', name: 'KeePassXC', cat: 'Security & Privacy' },
    { repo: 'ente-io/ente', name: 'Ente Photos', cat: 'Security & Privacy' },
    { repo: 'beemdevelopment/Aegis', name: 'Aegis Authenticator', cat: 'Security & Privacy' },
    { repo: 'mullvad/mullvad-browser', name: 'Mullvad Browser', cat: 'Security & Privacy' },
    { repo: 'cryptomator/cryptomator', name: 'Cryptomator', cat: 'Security & Privacy' },
    { repo: 'qutebrowser/qutebrowser', name: 'qutebrowser', cat: 'Security & Privacy' },
    // Communication (11)
    { repo: 'telegramdesktop/tdesktop', name: 'Telegram Desktop', cat: 'Communication' },
    { repo: 'element-hq/element-web', name: 'Element', cat: 'Communication' },
    { repo: 'element-hq/element-android', name: 'Element Android', cat: 'Communication' },
    { repo: 'thunderbird/thunderbird-android', name: 'Thunderbird for Android', cat: 'Communication' },
    { repo: 'M66B/FairEmail', name: 'FairEmail', cat: 'Communication' },
    { repo: 'simplex-chat/simplex-chat', name: 'SimpleX Chat', cat: 'Communication' },
    { repo: 'cinnyapp/cinny', name: 'Cinny', cat: 'Communication' },
    { repo: 'zulip/zulip', name: 'Zulip', cat: 'Communication' },
    { repo: 'RocketChat/Rocket.Chat', name: 'Rocket.Chat', cat: 'Communication' },
    { repo: 'tuskyapp/Tusky', name: 'Tusky', cat: 'Communication' },
    { repo: 'mastodon/mastodon', name: 'Mastodon', cat: 'Communication' },
    // Self-hosted (23)
    { repo: 'immich-app/immich', name: 'Immich', cat: 'Self-hosted' },
    { repo: 'syncthing/syncthing', name: 'Syncthing', cat: 'Self-hosted' },
    { repo: 'nextcloud/server', name: 'Nextcloud', cat: 'Self-hosted' },
    { repo: 'AdguardTeam/AdGuardHome', name: 'AdGuard Home', cat: 'Self-hosted' },
    { repo: 'miniflux/v2', name: 'Miniflux', cat: 'Self-hosted' },
    { repo: 'paperless-ngx/paperless-ngx', name: 'Paperless-ngx', cat: 'Self-hosted' },
    { repo: 'louislam/Uptime-Kuma', name: 'Uptime Kuma', cat: 'Self-hosted' },
    { repo: 'louislam/dockge', name: 'Dockge', cat: 'Self-hosted' },
    { repo: 'go-gitea/gitea', name: 'Gitea', cat: 'Self-hosted' },
    { repo: 'Sonarr/Sonarr', name: 'Sonarr', cat: 'Self-hosted' },
    { repo: 'Radarr/Radarr', name: 'Radarr', cat: 'Self-hosted' },
    { repo: 'Fallenbagel/jellyseerr', name: 'Jellyseerr', cat: 'Self-hosted' },
    { repo: 'SABnzbd/SABnzbd', name: 'SABnzbd', cat: 'Self-hosted' },
    { repo: 'coollabsio/coolify', name: 'Coolify', cat: 'Self-hosted' },
    { repo: 'goauthentik/authentik', name: 'authentik', cat: 'Self-hosted' },
    { repo: 'keycloak/keycloak', name: 'Keycloak', cat: 'Self-hosted' },
    { repo: 'netdata/netdata', name: 'Netdata', cat: 'Self-hosted' },
    { repo: 'freshrss/FreshRSS', name: 'FreshRSS', cat: 'Self-hosted' },
    { repo: 'photoprism/photoprism', name: 'PhotoPrism', cat: 'Self-hosted' },
    { repo: 'IceWhaleTech/CasaOS', name: 'CasaOS', cat: 'Self-hosted' },
    { repo: 'filebrowser/filebrowser', name: 'File Browser', cat: 'Self-hosted' },
    { repo: 'wallabag/wallabag', name: 'Wallabag', cat: 'Self-hosted' },
    { repo: 'mealie-recipes/mealie', name: 'Mealie', cat: 'Self-hosted' },
    // Developer Tools (12)
    { repo: 'microsoft/terminal', name: 'Windows Terminal', cat: 'Developer Tools' },
    { repo: 'microsoft/WSL', name: 'WSL', cat: 'Developer Tools' },
    { repo: 'PowerShell/PowerShell', name: 'PowerShell', cat: 'Developer Tools' },
    { repo: 'vscodium/vscodium', name: 'VSCodium', cat: 'Developer Tools' },
    { repo: 'zed-industries/zed', name: 'Zed', cat: 'Developer Tools' },
    { repo: 'lapce/lapce', name: 'Lapce', cat: 'Developer Tools' },
    { repo: 'alacritty/alacritty', name: 'Alacritty', cat: 'Developer Tools' },
    { repo: 'electron/electron', name: 'Electron', cat: 'Developer Tools' },
    { repo: 'discourse/discourse', name: 'Discourse', cat: 'Developer Tools' },
    { repo: 'caddyserver/caddy', name: 'Caddy', cat: 'Developer Tools' },
    { repo: 'containers/podman', name: 'Podman', cat: 'Developer Tools' },
    { repo: 'usebruno/bruno', name: 'Bruno', cat: 'Developer Tools' },
    // Utilities (14)
    { repo: 'yt-dlp/yt-dlp', name: 'yt-dlp', cat: 'Utilities' },
    { repo: 'sumatrapdfreader/sumatrapdf', name: 'Sumatra PDF', cat: 'Utilities' },
    { repo: 'duplicati/duplicati', name: 'Duplicati', cat: 'Utilities' },
    { repo: 'Heroic-Games-Launcher/HeroicGamesLauncher', name: 'Heroic Games Launcher', cat: 'Utilities' },
    { repo: 'qarmin/czkawka', name: 'Czkawka', cat: 'Utilities' },
    { repo: 'localsend/localsend', name: 'LocalSend', cat: 'Utilities' },
    { repo: 'PrismLauncher/PrismLauncher', name: 'Prism Launcher', cat: 'Utilities' },
    { repo: 'mihonapp/mihon', name: 'Mihon', cat: 'Utilities' },
    { repo: 'borgbackup/borg', name: 'BorgBackup', cat: 'Utilities' },
    { repo: 'pbatard/rufus', name: 'Rufus', cat: 'Utilities' },
    { repo: 'restic/restic', name: 'Restic', cat: 'Utilities' },
    { repo: 'kopia/kopia', name: 'Kopia', cat: 'Utilities' },
    { repo: 'Stirling-Tools/Stirling-PDF', name: 'Stirling PDF', cat: 'Utilities' },
    { repo: 'balena-io/etcher', name: 'balenaEtcher', cat: 'Utilities' }
]

const API = 'https://api.github.com'
const CAP = 100
const MAX_AGE_DAYS = 365

// Matches tags like 1.2.3-beta.1, v5.0-rc2, 2024.6.121-alpha+ ... but not
// ordinary words inside a tag that just happen to contain those letters.
const BETA_RE = /(^|[^a-z])(beta|alpha|rc[.\-_0-9]*|release[.\-_ ]?candidate|preview|pre.?release|canary|nightly)([^a-z]|$)/i

function headers() {
    const h = { Accept: 'application/vnd.github+json' }
    if (process.env.GITHUB_TOKEN) h.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`
    return h
}

let rateLimited = false

async function getJson(url) {
    const res = await fetch(url, { headers: headers() })
    if (res.status === 403 && res.headers.get('x-ratelimit-remaining') === '0') {
        rateLimited = true
        return null
    }
    if (!res.ok) return null
    return res.json()
}

const isBeta = (r) => !!r && !r.draft && (!!r.prerelease || BETA_RE.test(r.tag_name || ''))
const isStable = (r) => !!r && !r.draft && !r.prerelease && !BETA_RE.test(r.tag_name || '')
const dateOf = (r) => r.published_at || r.created_at || ''

async function fetchBeta(p) {
    try {
        const list = await getJson(`${API}/repos/${p.repo}/releases?per_page=30`)
        if (!Array.isArray(list)) return null
        const beta = list.find(isBeta)
        if (!beta) return null
        const when = dateOf(beta)
        if (!when) return null
        const ageDays = (Date.now() - new Date(when).getTime()) / 86400000
        if (ageDays > MAX_AGE_DAYS) return null
        const stable = list.find(isStable)
        return {
            repo: p.repo,
            name: p.name,
            cat: p.cat,
            tag: beta.tag_name,
            title: beta.name || '',
            date: when,
            url: beta.html_url,
            stableTag: stable ? stable.tag_name : '',
            stableDate: stable ? dateOf(stable) : ''
        }
    } catch {
        return null
    }
}

const out = []
const skipped = []
const CHUNK = 8
for (let i = 0; i < PROJECTS.length; i += CHUNK) {
    const batch = PROJECTS.slice(i, i + CHUNK)
    const results = await Promise.allSettled(batch.map(fetchBeta))
    results.forEach((r, j) => {
        if (r.status === 'fulfilled' && r.value) out.push(r.value)
        else skipped.push(batch[j].repo)
    })
    if (rateLimited) {
        console.log(`GitHub API rate limit reached after ${i + batch.length} repos — skipping the rest.`)
        break
    }
    if (i + CHUNK < PROJECTS.length) await new Promise((res) => setTimeout(res, 300))
}

out.sort((a, b) => (b.date || '').localeCompare(a.date || ''))
const items = out.slice(0, CAP)

const fs = await import('node:fs')
fs.mkdirSync('public/data', { recursive: true })
fs.writeFileSync(
    'public/data/betas.json',
    JSON.stringify({ updated: new Date().toISOString(), total: PROJECTS.length, items: items })
)

console.log(`Beta Radar: wrote ${items.length}/${PROJECTS.length} betas (cap ${CAP}) to public/data/betas.json`)
if (skipped.length) {
    console.log(`No recent beta for ${skipped.length}: ${skipped.join(', ')}`)
}
