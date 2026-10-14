export function normalizeSearch(value) {
    return String(value || '')
        .normalize('NFD')
        .replace(/\p{M}/gu, '')
        .toLocaleLowerCase()
        .replace(/[^\p{L}\p{N}]+/gu, ' ')
        .trim();
}
export function matchesSearch(content, query) {
    const words = normalizeSearch(query).split(/\s+/).filter(Boolean);
    const normalized = normalizeSearch(content).replace(/\s+/g, '');
    return words.every((word) => normalized.includes(word));
}
