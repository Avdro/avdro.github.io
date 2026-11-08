// Fixed tag dictionary for blog posts (120 tags).
// Articles may only use tags from this list — all lowercase, hyphens instead of spaces.
export const TAGS = [
    // Platforms & environment
    'linux', 'windows', 'macos', 'android', 'ios', 'web', 'self-hosted', 'cross-platform', 'portable-apps',
    // Operating systems
    'distros', 'desktop-environments', 'package-managers', 'terminal', 'command-line',
    // Office & productivity
    'documents', 'spreadsheets', 'presentations', 'notes', 'markdown', 'pdf', 'tasks', 'calendar', 'knowledge-base', 'wiki', 'ebooks', 'collaboration', 'ocr',
    // Graphics & design
    'vector-graphics', 'digital-painting', '3d-modeling', 'animation', 'cad', 'ui-design', 'illustration', 'diagrams', 'fonts', 'icons',
    // Media editing
    'photo-editing', 'raw-processing', 'video-editing', 'audio-editing', 'music-production', 'podcast', 'screen-recording', 'subtitles', 'streaming', 'video-conversion',
    // Media players
    'codecs', 'internet-radio', 'home-theater', 'media-library', 'audio-playback', 'video-playback',
    // Software development
    'programming', 'code-editors', 'ide', 'version-control', 'web-development', 'static-sites', 'databases', 'sql', 'api', 'testing', 'devops', 'containers', 'regex', 'documentation',
    // Security & privacy
    'privacy', 'security', 'encryption', 'vpn', 'passwords', '2fa', 'antivirus', 'firewall', 'anonymity', 'anti-tracking',
    // Communication
    'email', 'messengers', 'team-chat', 'video-calls', 'forums', 'rss', 'social-networks', 'newsletters',
    // Internet
    'browsers', 'browser-extensions', 'ad-blocking', 'search-engines', 'dns', 'networking', 'file-sharing', 'torrents', 'download-managers', 'web-hosting', 'monitoring',
    // System
    'backup', 'archiving', 'file-managers', 'system-cleaners', 'disk-tools', 'partitioning', 'virtualization', 'desktop-search', 'launchers', 'clipboard', 'screenshots', 'system-monitoring', 'drivers',
    // Education & science
    'education', 'languages', 'math', 'science', 'flashcards', 'mind-maps', 'encyclopedia', 'maps', 'kids', 'typing', 'research'
] as const
