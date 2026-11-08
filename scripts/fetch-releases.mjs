// Fetches the latest stable release of every tracked project from the GitHub
// API and writes public/data/releases.json for the Release Radar page.
// Runs inside GitHub Actions — the built-in GITHUB_TOKEN is plenty for 150 repos.
// Fallback chain per repo: latest release -> newest stable release -> newest tag.

const PROJECTS = [
    // Media & Video (14)
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
    { repo: 'videolan/vlc', name: 'VLC', cat: 'Media & Video' },
    { repo: 'KDE/kdenlive', name: 'Kdenlive', cat: 'Media & Video' },
    { repo: 'OpenShot/openshot-qt', name: 'OpenShot', cat: 'Media & Video' },
    { repo: 'streamlink/streamlink', name: 'Streamlink', cat: 'Media & Video' },
    // Graphics (12)
    { repo: 'inkscape/inkscape', name: 'Inkscape', cat: 'Graphics' },
    { repo: 'gnome/gimp', name: 'GIMP', cat: 'Graphics' },
    { repo: 'blender/blender', name: 'Blender', cat: 'Graphics' },
    { repo: 'KDE/krita', name: 'Krita', cat: 'Graphics' },
    { repo: 'darktable-org/darktable', name: 'darktable', cat: 'Graphics' },
    { repo: 'RawTherapee/RawTherapee', name: 'RawTherapee', cat: 'Graphics' },
    { repo: 'godotengine/godot', name: 'Godot Engine', cat: 'Graphics' },
    { repo: 'natrongithub/Natron', name: 'Natron', cat: 'Graphics' },
    { repo: 'excalidraw/excalidraw', name: 'Excalidraw', cat: 'Graphics' },
    { repo: 'ImageMagick/ImageMagick', name: 'ImageMagick', cat: 'Graphics' },
    { repo: 'jgraph/drawio', name: 'diagrams.net', cat: 'Graphics' },
    { repo: 'KDE/okular', name: 'Okular', cat: 'Graphics' },
    // Notes & Productivity (16)
    { repo: 'LibreOffice/core', name: 'LibreOffice', cat: 'Notes & Productivity' },
    { repo: 'laurent22/joplin', name: 'Joplin', cat: 'Notes & Productivity' },
    { repo: 'appflowy-io/appflowy', name: 'AppFlowy', cat: 'Notes & Productivity' },
    { repo: 'logseq/logseq', name: 'Logseq', cat: 'Notes & Productivity' },
    { repo: 'standardnotes/app', name: 'Standard Notes', cat: 'Notes & Productivity' },
    { repo: 'siyuan-note/siyuan', name: 'SiYuan', cat: 'Notes & Productivity' },
    { repo: 'ankitects/anki', name: 'Anki', cat: 'Notes & Productivity' },
    { repo: 'zadam/trilium', name: 'Trilium Notes', cat: 'Notes & Productivity' },
    { repo: 'toeverything/AFFiNE', name: 'AFFiNE', cat: 'Notes & Productivity' },
    { repo: 'usememos/memos', name: 'Memos', cat: 'Notes & Productivity' },
    { repo: 'BookStackApp/BookStack', name: 'BookStack', cat: 'Notes & Productivity' },
    { repo: 'requarks/wiki', name: 'Wiki.js', cat: 'Notes & Productivity' },
    { repo: 'outline/outline', name: 'Outline', cat: 'Notes & Productivity' },
    { repo: 'nocodb/nocodb', name: 'NocoDB', cat: 'Notes & Productivity' },
    { repo: 'cal.com/cal.com', name: 'Cal.com', cat: 'Notes & Productivity' },
    { repo: 'johannesjo/super-productivity', name: 'Super Productivity', cat: 'Notes & Productivity' },
    // Security & Privacy (12)
    { repo: 'bitwarden/clients', name: 'Bitwarden', cat: 'Security & Privacy' },
    { repo: 'keepassxreboot/keepassxc', name: 'KeePassXC', cat: 'Security & Privacy' },
    { repo: 'dani-garcia/vaultwarden', name: 'Vaultwarden', cat: 'Security & Privacy' },
    { repo: 'signalapp/Signal-Desktop', name: 'Signal Desktop', cat: 'Security & Privacy' },
    { repo: 'cryptomator/cryptomator', name: 'Cryptomator', cat: 'Security & Privacy' },
    { repo: 'ente-io/ente', name: 'Ente Photos', cat: 'Security & Privacy' },
    { repo: 'beemdevelopment/Aegis', name: 'Aegis Authenticator', cat: 'Security & Privacy' },
    { repo: 'tailscale/tailscale', name: 'Tailscale', cat: 'Security & Privacy' },
    { repo: 'gorhill/uBlock', name: 'uBlock Origin', cat: 'Security & Privacy' },
    { repo: 'OpenVPN/openvpn', name: 'OpenVPN', cat: 'Security & Privacy' },
    { repo: 'wireguard/wireguard-tools', name: 'WireGuard Tools', cat: 'Security & Privacy' },
    { repo: 'mullvad/mullvad-browser', name: 'Mullvad Browser', cat: 'Security & Privacy' },
    // Communication (9)
    { repo: 'element-hq/element-web', name: 'Element', cat: 'Communication' },
    { repo: 'mastodon/mastodon', name: 'Mastodon', cat: 'Communication' },
    { repo: 'zulip/zulip', name: 'Zulip', cat: 'Communication' },
    { repo: 'jitsi/jitsi-meet', name: 'Jitsi Meet', cat: 'Communication' },
    { repo: 'RocketChat/Rocket.Chat', name: 'Rocket.Chat', cat: 'Communication' },
    { repo: 'simplex-chat/simplex-chat', name: 'SimpleX Chat', cat: 'Communication' },
    { repo: 'mumble-voip/mumble', name: 'Mumble', cat: 'Communication' },
    { repo: 'thunderbird/thunderbird-android', name: 'Thunderbird for Android', cat: 'Communication' },
    { repo: 'M66B/FairEmail', name: 'FairEmail', cat: 'Communication' },
    // Self-hosted (25)
    { repo: 'nextcloud/server', name: 'Nextcloud', cat: 'Self-hosted' },
    { repo: 'syncthing/syncthing', name: 'Syncthing', cat: 'Self-hosted' },
    { repo: 'immich-app/immich', name: 'Immich', cat: 'Self-hosted' },
    { repo: 'pi-hole/pi-hole', name: 'Pi-hole', cat: 'Self-hosted' },
    { repo: 'home-assistant/core', name: 'Home Assistant', cat: 'Self-hosted' },
    { repo: 'freshrss/FreshRSS', name: 'FreshRSS', cat: 'Self-hosted' },
    { repo: 'wallabag/wallabag', name: 'Wallabag', cat: 'Self-hosted' },
    { repo: 'paperless-ngx/paperless-ngx', name: 'Paperless-ngx', cat: 'Self-hosted' },
    { repo: 'penpot/penpot', name: 'Penpot', cat: 'Self-hosted' },
    { repo: 'louislam/Uptime-Kuma', name: 'Uptime Kuma', cat: 'Self-hosted' },
    { repo: 'louislam/dockge', name: 'Dockge', cat: 'Self-hosted' },
    { repo: 'portainer/portainer', name: 'Portainer', cat: 'Self-hosted' },
    { repo: 'go-gitea/gitea', name: 'Gitea', cat: 'Self-hosted' },
    { repo: 'Sonarr/Sonarr', name: 'Sonarr', cat: 'Self-hosted' },
    { repo: 'Radarr/Radarr', name: 'Radarr', cat: 'Self-hosted' },
    { repo: 'Fallenbagel/jellyseerr', name: 'Jellyseerr', cat: 'Self-hosted' },
    { repo: 'filebrowser/filebrowser', name: 'File Browser', cat: 'Self-hosted' },
    { repo: 'minio/minio', name: 'MinIO', cat: 'Self-hosted' },
    { repo: 'traefik/traefik', name: 'Traefik', cat: 'Self-hosted' },
    { repo: 'NginxProxyManager/nginx-proxy-manager', name: 'Nginx Proxy Manager', cat: 'Self-hosted' },
    { repo: 'goauthentik/authentik', name: 'authentik', cat: 'Self-hosted' },
    { repo: 'keycloak/keycloak', name: 'Keycloak', cat: 'Self-hosted' },
    { repo: 'supabase/supabase', name: 'Supabase', cat: 'Self-hosted' },
    { repo: 'appwrite/appwrite', name: 'Appwrite', cat: 'Self-hosted' },
    { repo: 'pocketbase/pocketbase', name: 'PocketBase', cat: 'Self-hosted' },
    // Developer Tools (46)
    { repo: 'microsoft/PowerToys', name: 'PowerToys', cat: 'Developer Tools' },
    { repo: 'microsoft/vscode', name: 'VS Code', cat: 'Developer Tools' },
    { repo: 'microsoft/terminal', name: 'Windows Terminal', cat: 'Developer Tools' },
    { repo: 'vscodium/vscodium', name: 'VSCodium', cat: 'Developer Tools' },
    { repo: 'neovim/neovim', name: 'Neovim', cat: 'Developer Tools' },
    { repo: 'vim/vim', name: 'Vim', cat: 'Developer Tools' },
    { repo: 'emacs-mirror/emacs', name: 'GNU Emacs', cat: 'Developer Tools' },
    { repo: 'helix-editor/helix', name: 'Helix', cat: 'Developer Tools' },
    { repo: 'zed-industries/zed', name: 'Zed', cat: 'Developer Tools' },
    { repo: 'lapce/lapce', name: 'Lapce', cat: 'Developer Tools' },
    { repo: 'ghostty-org/ghostty', name: 'Ghostty', cat: 'Developer Tools' },
    { repo: 'git/git', name: 'Git', cat: 'Developer Tools' },
    { repo: 'cli/cli', name: 'GitHub CLI', cat: 'Developer Tools' },
    { repo: 'jesseduffield/lazygit', name: 'Lazygit', cat: 'Developer Tools' },
    { repo: 'jqlang/jq', name: 'jq', cat: 'Developer Tools' },
    { repo: 'BurntSushi/ripgrep', name: 'ripgrep', cat: 'Developer Tools' },
    { repo: 'sharkdp/fd', name: 'fd', cat: 'Developer Tools' },
    { repo: 'curl/curl', name: 'curl', cat: 'Developer Tools' },
    { repo: 'ollama/ollama', name: 'Ollama', cat: 'Developer Tools' },
    { repo: 'rust-lang/rust', name: 'Rust', cat: 'Developer Tools' },
    { repo: 'golang/go', name: 'Go', cat: 'Developer Tools' },
    { repo: 'ziglang/zig', name: 'Zig', cat: 'Developer Tools' },
    { repo: 'php/php-src', name: 'PHP', cat: 'Developer Tools' },
    { repo: 'postgres/postgres', name: 'PostgreSQL', cat: 'Developer Tools' },
    { repo: 'redis/redis', name: 'Redis', cat: 'Developer Tools' },
    { repo: 'moby/moby', name: 'Docker Engine', cat: 'Developer Tools' },
    { repo: 'containers/podman', name: 'Podman', cat: 'Developer Tools' },
    { repo: 'kubernetes/kubernetes', name: 'Kubernetes', cat: 'Developer Tools' },
    { repo: 'helm/helm', name: 'Helm', cat: 'Developer Tools' },
    { repo: 'hashicorp/terraform', name: 'Terraform', cat: 'Developer Tools' },
    { repo: 'ansible/ansible', name: 'Ansible', cat: 'Developer Tools' },
    { repo: 'gohugoio/hugo', name: 'Hugo', cat: 'Developer Tools' },
    { repo: 'caddyserver/caddy', name: 'Caddy', cat: 'Developer Tools' },
    { repo: 'denoland/deno', name: 'Deno', cat: 'Developer Tools' },
    { repo: 'oven-sh/bun', name: 'Bun', cat: 'Developer Tools' },
    { repo: 'nodejs/node', name: 'Node.js', cat: 'Developer Tools' },
    { repo: 'python/cpython', name: 'Python', cat: 'Developer Tools' },
    { repo: 'astral-sh/uv', name: 'uv', cat: 'Developer Tools' },
    { repo: 'astral-sh/ruff', name: 'Ruff', cat: 'Developer Tools' },
    { repo: 'biomejs/biome', name: 'Biome', cat: 'Developer Tools' },
    { repo: 'facebook/react', name: 'React', cat: 'Developer Tools' },
    { repo: 'vuejs/core', name: 'Vue', cat: 'Developer Tools' },
    { repo: 'microsoft/TypeScript', name: 'TypeScript', cat: 'Developer Tools' },
    { repo: 'tailwindlabs/tailwindcss', name: 'Tailwind CSS', cat: 'Developer Tools' },
    { repo: 'vitejs/vite', name: 'Vite', cat: 'Developer Tools' },
    { repo: 'prettier/prettier', name: 'Prettier', cat: 'Developer Tools' },
    // Utilities (16)
    { repo: 'localsend/localsend', name: 'LocalSend', cat: 'Utilities' },
    { repo: 'ShareX/ShareX', name: 'ShareX', cat: 'Utilities' },
    { repo: 'flameshot-org/flameshot', name: 'Flameshot', cat: 'Utilities' },
    { repo: 'yt-dlp/yt-dlp', name: 'yt-dlp', cat: 'Utilities' },
    { repo: 'ventoy/Ventoy', name: 'Ventoy', cat: 'Utilities' },
    { repo: 'balena-io/etcher', name: 'balenaEtcher', cat: 'Utilities' },
    { repo: 'pbatard/rufus', name: 'Rufus', cat: 'Utilities' },
    { repo: 'Genymobile/scrcpy', name: 'scrcpy', cat: 'Utilities' },
    { repo: 'kovidgoyal/calibre', name: 'Calibre', cat: 'Utilities' },
    { repo: 'zotero/zotero', name: 'Zotero', cat: 'Utilities' },
    { repo: 'sumatrapdfreader/sumatrapdf', name: 'Sumatra PDF', cat: 'Utilities' },
    { repo: 'ip7z/7zip', name: '7-Zip', cat: 'Utilities' },
    { repo: 'AutoHotkey/AutoHotkey', name: 'AutoHotkey', cat: 'Utilities' },
    { repo: 'Stirling-Tools/Stirling-PDF', name: 'Stirling PDF', cat: 'Utilities' },
    { repo: 'kopia/kopia', name: 'Kopia', cat: 'Utilities' },
    { repo: 'restic/restic', name: 'Restic', cat: 'Utilities' }
]

const API = 'https://api.github.com'

function headers() {
    const h = { Accept: 'application/vnd.github+json' }
    if (process.env.GITHUB_TOKEN) h.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`
    return h
}

async function getJson(url) {
    const res = await fetch(url, { headers: headers() })
    if (!res.ok) return null
    return res.json()
}

// 1) latest stable release  2) newest stable in the list  3) newest tag
async function fetchLatest(p) {
    try {
        const r = await getJson(`${API}/repos/${p.repo}/releases/latest`)
        if (r && r.tag_name) {
            return item(p, r.tag_name, r.name || '', r.published_at || '', r.html_url)
        }
        const list = await getJson(`${API}/repos/${p.repo}/releases?per_page=10`)
        if (Array.isArray(list)) {
            const stable = list.find((x) => x && !x.draft && !x.prerelease && x.tag_name)
            if (stable) {
                return item(p, stable.tag_name, stable.name || '', stable.published_at || '', stable.html_url)
            }
        }
        const tags = await getJson(`${API}/repos/${p.repo}/tags?per_page=1`)
        if (Array.isArray(tags) && tags[0] && tags[0].name) {
            let date = ''
            if (tags[0].commit && tags[0].commit.sha) {
                const c = await getJson(`${API}/repos/${p.repo}/commits/${tags[0].commit.sha}`)
                if (c && c.commit && c.commit.committer && c.commit.committer.date) {
                    date = c.commit.committer.date
                }
            }
            return item(p, tags[0].name, '', date, `${API}/${p.repo}/tags`)
        }
        return null
    } catch {
        return null
    }
}

function item(p, tag, title, date, url) {
    return { repo: p.repo, name: p.name, cat: p.cat, tag: tag, title: title, date: date, url: url }
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
fs.writeFileSync(
    'public/data/releases.json',
    JSON.stringify({ updated: new Date().toISOString(), total: PROJECTS.length, items: out })
)

console.log(`Release Radar: wrote ${out.length}/${PROJECTS.length} releases to public/data/releases.json`)
if (out.length < PROJECTS.length) {
    console.log(`Skipped ${PROJECTS.length - out.length} repos (no releases and no tags, or API errors).`)
}
