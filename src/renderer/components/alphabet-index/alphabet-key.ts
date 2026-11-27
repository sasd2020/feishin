// Index letter for a name: A-Z, '#' for digits/symbols, and one bucket each
// for kana, CJK ideographs, Hangul and other scripts.
export const ALPHABET_LATIN = '#ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
export const ALPHABET_EXTRA = ['あ', '漢', '한', '…'];

export const alphabetKey = (text: null | string | undefined): string => {
    const c = (text || '').trim().normalize('NFD').replace(/[̀-ͯ]/g, '').charAt(0).toUpperCase();
    if (/[A-Z]/.test(c)) return c;
    if (/[぀-ヿㇰ-ㇿ]/.test(c)) return 'あ';
    if (/[㐀-䶿一-鿿豈-﫿]/.test(c)) return '漢';
    if (/[가-힯ᄀ-ᇿ]/.test(c)) return '한';
    if (/\p{L}/u.test(c)) return '…';
    return '#';
};
