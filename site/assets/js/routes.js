export const pageKeys = ['home', 'about', 'rooms', 'facilities', 'gallery', 'testimonials', 'faq', 'contact'];
export function pageUrl(locale = 'id', page = 'home', preview = false, room = null) {
    if (preview) {
        const query = new URLSearchParams({ locale, page });
        if (room !== null) query.set('room', String(room));
        return `/admin/preview?${query}`;
    }
    if (page === 'room') return `/${locale}/rooms/detail?room=${encodeURIComponent(room ?? '')}`;
    return `/${locale}${page === 'home' ? '' : `/${page}`}`;
}
export function resolvePage(pathname, search = '') {
    const query = new URLSearchParams(search),
        preview = pathname.replace(/\/$/, '') === '/admin/preview';
    const parts = pathname.split('/').filter(Boolean);
    const locale = preview ? (query.get('locale') === 'en' ? 'en' : 'id') : parts[0] === 'en' ? 'en' : 'id';
    const key = preview
        ? query.get('page') || 'home'
        : parts[1] === 'rooms' && parts[2] === 'detail'
          ? 'room'
          : parts[1] || 'home';
    return {
        locale,
        preview,
        view: pageKeys.includes(key) || key === 'room' ? key : 'home',
        roomId: Number(query.get('room')) || null,
    };
}
