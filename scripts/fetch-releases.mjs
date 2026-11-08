// Fetches the latest stable release of every tracked project from the GitHub
// API and writes public/data/releases.json for the Release Radar page.
// Runs inside GitHub Actions — the built-in GITHUB_TOKEN is plenty for 65 repos.

const PROJECTS = [
    // Media & Video
    { repo: 'obsproject/obs-studio', name: 'OBS Studio', cat: 'Media & Video' },
    { repo: 'audacity/audacity', name: 'Audacity', cat: 'Media & Video' },
    { repo: 'mltframework/shotcut', name: 'Shotcut', cat: 'Media & Video' },
    { repo: 'HandBrake/HandBrake', name: 'HandBrake', cat: 'Media & Video' },
    { repo: 'mpv-player/mpv', name: 'mpv', cat: 'Media & Video' },
    { repo: 'jellyfin/jellyfin', name: 'Jellyfin', cat: 'Media & Video' },
    { repo: 'advplyr/audiobookshelf', name: 'Audiobookshelf', cat: 'Media & Video' },
    { repo: 'navidrome/navidrome', name: 'Navidrome', cat: 'Media & Video' },
    { repo: 'qbittorrent/qbittorrent', name: 'qBittorrent', cat: 'Media & Video' },
    { repo: 'transmission/transmission', name: 'Transmission', cat: 'Media & Video' },
    // Graphics
    { repo: 'inkscape/inkscape', name: 'Inkscape', cat: 'Graphics' },
    { repo: 'darktable-org/darktable', name: 'darktable', cat: 'Graphics' },
    { repo: 'RawTherapee/RawTherapee', name: 'RawTherapee', cat: 'Graphics' },
    { repo: 'godotengine/godot', name: 'Godot Engine', cat: 'Graphics' },
    { repo: 'natrongithub/Natron', name: 'Natron', cat: 'Graphics' },
    { repo: 'excalidraw/excalidraw', name: 'Excalidraw', cat: 'Graphics' },
    // Notes & Productivity
    { repo: 'laurent22/joplin', name: 'Joplin', cat: 'Notes & Productivity' },
    { repo: 'appflowy-io/appflowy', name: 'AppFlowy', cat: 'Notes & Productivity' },
    { repo: 'logseq/logseq', name: 'Logseq', cat: 'Notes & Productivity' },
    { repo: 'standardnotes/app', name: 'Standard Notes', cat: 'Notes & Productivity' },
    { repo: 'siyuan-note/siyuan', name: 'SiYuan', cat: 'Notes & Productivity' },
    { repo: 'nocodb/nocodb', name: 'NocoDB', cat: 'Notes & Productivity' },
    { repo: 'cal.com/cal.com', name: 'Cal.com', cat: 'Notes & Productivity' },
    // Security & Privacy
    { repo: 'bitwarden/clients', name: 'Bitwarden', cat: 'Security & Privacy' },
    { repo: 'keepassxreboot/keepassxc', name: 'KeePassXC', cat: 'Security & Privacy' },
    { repo: 'signalapp/Signal-Desktop', name: 'Signal Desktop', cat: 'Security & Privacy' },
    { repo: 'cryptomator/cryptomator', name: 'Cryptomator', cat: 'Security & Privacy' },
    { repo: 'ente-io/ente', name: 'Ente Photos', cat: 'Security & Privacy' },
    { repo: 'beemdevelopment/Aegis', name: 'Aegis Authenticator', cat: 'Security & Privacy' },
    { repo: 'tailscale/tailscale', name: 'Tailscale', cat: 'Security & Privacy' },
    // Communication
    { repo: 'element-hq/element-web', name: 'Element', cat: 'Communication' },
    { repo: 'mastodon/mastodon', name: 'Mastodon', cat: 'Communication' },
    { repo: 'zulip/zulip', name: 'Zulip', cat: 'Communication' },
    { repo: 'jitsi/jitsi-meet', name: 'Jitsi Meet', cat: 'Communication' },
    // Self-hosted
    { repo: 'nextcloud/server', name: 'Nextcloud', cat: 'Self-hosted' },
    { repo: 'syncthing/syncthing', name: 'Syncthing', cat: 'Self-hosted' },
    { repo: 'immich-app/immich', name: 'Immich', cat: 'Self-hosted' },
    { repo: 'pi-hole/pi-hole', name: 'Pi-hole', cat: 'Self-hosted' },
    { repo: 'home-assistant/core', name: 'Home Assistant', cat: 'Self-hosted' },
    { repo: 'freshrss/FreshRSS', name: 'FreshRSS', cat: 'Self-hosted' },
    { repo: 'wallabag/wallabag', name: 'Wallabag', cat: 'Self-hosted' },
    { repo: 'paperless-ngx/paperless-ngx', name: 'Paperless-ngx', cat: 'Self-hosted' },
    { repo: 'penpot/penpot', name: 'Penpot', cat: 'Self-hosted' },
    // Developer Tools
    { repo: 'microsoft/PowerToys', name: 'PowerToys', cat: 'Developer Tools' },
    { repo: 'microsoft/vscode', name: 'VS Code', cat: 'Developer Tools' },
    { repo: 'vscodium/vscodium', name: 'VSCodium', cat: 'Developer Tools' },
    { repo: 'neovim/neovim', name: 'Neovim', cat: 'Developer Tools' },
    { repo: 'helix-editor/helix', name: 'Helix', cat: 'Developer Tools' },
    { repo: 'ziglang/zig', name: 'Zig', cat: 'Developer Tools' },
    { repo: 'denoland/deno', name: 'Deno', cat: 'Developer Tools' },
    { repo: 'oven-sh/bun', name: 'Bun', cat: 'Developer Tools' },
    { repo: 'nodejs/node', name: 'Node.js', cat: 'Developer Tools' },
    { repo: 'python/cpython', name: 'Python', cat: 'Developer Tools' },
    { repo: 'gohugoio/hugo', name: 'Hugo', cat: 'Developer Tools' },
    { repo: 'caddyserver/caddy', name: 'Caddy', cat: 'Developer Tools' },
    { repo: 'containers/podman', name: 'Podman', cat: 'Developer Tools' },
    { repo: 'kubernetes/kubernetes', name: 'Kubernetes', cat: 'Developer Tools' },
    // Utilities
    { repo: 'localsend/localsend', name: 'LocalSend', cat: 'Utilities' },
    { repo: 'ShareX/ShareX', name: 'ShareX', cat: 'Utilities' },
    { repo: 'flameshot-org/flameshot', name: 'Flameshot', cat: 'Utilities' },
    { repo: 'yt-dlp/yt-dlp', name: 'yt-dlp', cat: 'Utilities' },
    { repo: 'ventoy/Ventoy', name: 'Ventoy', cat: 'Utilities' },
    { repo: 'balena-io/etcher', name: 'balenaEtcher', cat: 'Utilities' },
    { repo: 'kopia/kopia', name: 'Kopia', cat: 'Utilities' },
    { repo: 'restic/restic', name: 'Restic', cat: 'Utilities' }
]

async function fetchLatest(p) {
    const headers = { Accept: 'application/vnd.github+json' }
    if (process.env.GITHUB_TOKEN) headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`
    const res = await fetch(`https://api.github.com/repos/${p.repo}/releases/latest`, { headers })
    if (!res.ok) return null
    const r = await res.json()
    if (!r || !r.tag_name) return null
    return {
        repo: p.repo,
        name: p.name,
        cat: p.cat,
        tag: r.tag_name,
        title: r.name || '',
        date: r.published_at || '',
        url: r.html_url
    }
}

const out = []
const CHUNK = 8
for (let i = 0; i < PROJECTS.length; i += CHUNK) {
    const batch = PROJECTS.slice(i, i + CHUNK)
    const results = await Promise.allSettled(batch.map(fetchLatest))
    for (const r of results) {
        if (r.status === 'fulfilled' && r.value) out.push(r.value)
    }
    if (i + CHUNK < PROJECTS.length) await new Promise((res) => setTimeout(res, 300))
}

out.sort((a, b) => (b.date || '').localeCompare(a.date || ''))

const fs = await import('node:fs')
fs.mkdirSync('public/data', { recursive: true })
fs.writeFileSync('public/data/releases.json', JSON.stringify({ updated: new Date().toISOString(), items: out }))

console.log(`Release Radar: wrote ${out.length}/${PROJECTS.length} releases to public/data/releases.json`)
if (out.length < PROJECTS.length) {
    console.log(`Skipped ${PROJECTS.length - out.length} repos (no GitHub releases or temporary API errors).`)
}
