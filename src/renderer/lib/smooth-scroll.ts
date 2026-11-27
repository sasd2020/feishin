import Lenis from 'lenis';

// Smooth mouse-wheel scrolling with Lenis (https://github.com/darkroomengineering/lenis).
// Feishin has many separate scroll areas (virtual lists, side panels, pages),
// so each one gets its own Lenis the first time the wheel turns over it.
// Touch and trackpad-free devices keep native scrolling; so do people who
// ask their system for reduced motion, and anything marked data-lenis-prevent.

const NATIVE = '[data-lenis-prevent], [role="slider"], .mantine-Slider-root, textarea, select';

const instances = new Map<HTMLElement, Lenis>();

const isScrollable = (el: HTMLElement) => {
    const { overflowY } = getComputedStyle(el);
    return (
        (overflowY === 'auto' || overflowY === 'scroll') && el.scrollHeight > el.clientHeight + 1
    );
};

const scrollAreaFor = (target: EventTarget | null): HTMLElement | null => {
    for (let el = target as HTMLElement | null; el && el !== document.body; el = el.parentElement) {
        if (el.matches?.(NATIVE)) return null;
        if (isScrollable(el)) return el;
    }
    return null;
};

const sweep = () => {
    instances.forEach((lenis, el) => {
        if (!el.isConnected) {
            lenis.destroy();
            instances.delete(el);
        }
    });
};

const LERP = 0.09;
let enabled = false;

const lenisFor = (area: HTMLElement): Lenis => {
    const existing = instances.get(area);
    if (existing) return existing;
    sweep();
    const lenis = new Lenis({
        allowNestedScroll: true,
        autoRaf: true,
        content: (area.firstElementChild as HTMLElement | null) || area,
        lerp: LERP,
        prevent: (node) => !!node.closest?.(NATIVE),
        smoothWheel: true,
        syncTouch: false,
        wrapper: area,
    });
    instances.set(area, lenis);
    return lenis;
};

const onWheel = (e: WheelEvent) => {
    if (e.ctrlKey || e.defaultPrevented) return; // pinch-zoom, or already handled
    const area = scrollAreaFor(e.target);
    // Created during this event's capture phase, so its own wheel listener on
    // the area still receives this same event.
    if (area) lenisFor(area);
};

// The scroll area inside an element (e.g. a virtual list's viewport).
export const findScrollArea = (root: HTMLElement | null): HTMLElement | null => {
    if (!root) return null;
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_ELEMENT);
    for (
        let n = walker.nextNode() as HTMLElement | null;
        n;
        n = walker.nextNode() as HTMLElement | null
    ) {
        if (isScrollable(n)) return n;
    }
    return null;
};

// Glide a scroll area to a position with the same easing as the mouse wheel.
export const glideTo = (area: HTMLElement | null, top: number): boolean => {
    if (!enabled || !area) return false;
    lenisFor(area).scrollTo(top, { force: true, lerp: LERP });
    return true;
};

export const initSmoothScroll = () => {
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return;
    enabled = true;
    window.addEventListener('wheel', onWheel, { capture: true, passive: true });
};
