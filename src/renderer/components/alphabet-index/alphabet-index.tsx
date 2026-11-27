import clsx from 'clsx';
import {
    ReactNode,
    PointerEvent as ReactPointerEvent,
    Ref,
    useEffect,
    useImperativeHandle,
    useMemo,
    useRef,
    useState,
} from 'react';

import styles from './alphabet-index.module.css';

import { ALPHABET_EXTRA, ALPHABET_LATIN } from '/@/renderer/components/alphabet-index/alphabet-key';

export interface AlphabetIndexHandle {
    // Called with the list's first visible item, to light up its letter
    setStartIndex: (index: number) => void;
}

interface AlphabetIndexProps {
    children: ReactNode;
    // Index letter of every item, in list order; null hides the index
    keys: null | string[];
    onJump: (index: number, container: HTMLElement | null) => void;
    ref?: Ref<AlphabetIndexHandle>;
}

// Dock-style magnification
const MAX_SCALE = 1.9;
const SIGMA = 26;
const PUSH = 14;

// A-Z column on the right edge of a list: click or drag to jump; the letter
// under the pointer swells like the macOS Dock.
export const AlphabetIndex = ({ children, keys, onJump, ref }: AlphabetIndexProps) => {
    const [active, setActive] = useState<null | string>(null);
    const [bubble, setBubble] = useState<null | string>(null);
    const [dragging, setDragging] = useState(false);
    const navRef = useRef<HTMLDivElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const activeRef = useRef<null | string>(null);
    const draggingRef = useRef(false);
    // After a jump the letter picked stays lit until the user scrolls on
    // their own (a grid row can start with the previous letter's last items)
    const holding = useRef(false);
    const bubbleTimer = useRef<ReturnType<typeof setTimeout>>(undefined);

    const { firstIndex, letters } = useMemo(() => {
        const first = new Map<string, number>();
        (keys || []).forEach((k, i) => {
            if (!first.has(k)) first.set(k, i);
        });
        return {
            firstIndex: first,
            letters: [...ALPHABET_LATIN, ...ALPHABET_EXTRA.filter((k) => first.has(k))],
        };
    }, [keys]);

    const showBubble = (k: string) => {
        setBubble(k);
        clearTimeout(bubbleTimer.current);
        bubbleTimer.current = setTimeout(() => setBubble(null), 700);
    };

    useImperativeHandle(
        ref,
        () => ({
            setStartIndex: (index: number) => {
                if (holding.current) return;
                const k = keys?.[index] ?? null;
                const prev = activeRef.current;
                if (k === prev) return;
                activeRef.current = k;
                setActive(k);
                // While scrolling, briefly show the letter we moved into
                if (k && prev && !draggingRef.current) showBubble(k);
            },
        }),
        [keys],
    );

    const jump = (k: string) => {
        const i = firstIndex.get(k);
        if (i === undefined) return;
        holding.current = true;
        onJump(i, containerRef.current);
        activeRef.current = k;
        setActive(k);
        showBubble(k);
    };

    const letterAt = (clientY: number) => {
        let best: null | string = null;
        let bestD = Infinity;
        navRef.current?.querySelectorAll<HTMLButtonElement>('button').forEach((b) => {
            if (b.disabled) return;
            const r = b.getBoundingClientRect();
            const d = Math.abs(r.top + r.height / 2 - clientY);
            if (d < bestD) {
                bestD = d;
                best = b.dataset.k || null;
            }
        });
        return best;
    };

    // Magnification: ease each letter toward its target scale every frame
    const pointerY = useRef<null | number>(null);
    const scales = useRef<number[]>([]);
    const raf = useRef(0);
    const reduceMotion =
        typeof window !== 'undefined' &&
        window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

    const frame = () => {
        const nav = navRef.current;
        if (!nav) return;
        const btns = Array.from(nav.querySelectorAll<HTMLButtonElement>('button'));
        const h = btns[0]?.offsetHeight || 14;
        const top = nav.getBoundingClientRect().top;
        let moving = false;
        btns.forEach((b, i) => {
            let target = 1;
            if (pointerY.current !== null && !reduceMotion) {
                const d = pointerY.current - (top + b.offsetTop + h / 2);
                target = 1 + (MAX_SCALE - 1) * Math.exp(-(d * d) / (2 * SIGMA * SIGMA));
            }
            const cur = scales.current[i] ?? 1;
            let next = cur + (target - cur) * 0.28;
            if (Math.abs(target - next) < 0.002) next = target;
            else moving = true;
            scales.current[i] = next;
        });
        const extra = scales.current.map((s) => (s - 1) * h);
        const total = extra.reduce((a, b) => a + b, 0);
        let above = 0;
        btns.forEach((b, i) => {
            const s = scales.current[i];
            const ty = above + extra[i] / 2 - total / 2;
            above += extra[i];
            b.style.transform =
                s === 1 && !total
                    ? ''
                    : `translate3d(${(-(s - 1) * PUSH).toFixed(2)}px,${ty.toFixed(2)}px,0) scale(${s.toFixed(3)})`;
        });
        raf.current = moving || pointerY.current !== null ? requestAnimationFrame(frame) : 0;
    };

    const kick = () => {
        if (!raf.current) raf.current = requestAnimationFrame(frame);
    };

    useEffect(
        () => () => {
            cancelAnimationFrame(raf.current);
            clearTimeout(bubbleTimer.current);
        },
        [],
    );

    useEffect(() => {
        const release = () => {
            holding.current = false;
        };
        const opts = { capture: true, passive: true };
        window.addEventListener('wheel', release, opts);
        window.addEventListener('touchstart', release, opts);
        window.addEventListener('keydown', release, opts);
        return () => {
            window.removeEventListener('wheel', release, opts);
            window.removeEventListener('touchstart', release, opts);
            window.removeEventListener('keydown', release, opts);
        };
    }, []);

    const onPointerDown = (e: ReactPointerEvent<HTMLDivElement>) => {
        if (e.pointerType === 'mouse' && e.button !== 0) return;
        e.currentTarget.setPointerCapture(e.pointerId);
        setDragging(true);
        draggingRef.current = true;
        const k = letterAt(e.clientY);
        if (k) jump(k);
        e.preventDefault();
    };

    const onPointerMove = (e: ReactPointerEvent<HTMLDivElement>) => {
        pointerY.current = e.clientY;
        kick();
        if (!dragging) return;
        const k = letterAt(e.clientY);
        if (k && k !== active) jump(k);
    };

    const endDrag = () => {
        setDragging(false);
        draggingRef.current = false;
    };

    const bubbleTop = useMemo(() => {
        if (!bubble || !navRef.current) return 0;
        const b = navRef.current.querySelector<HTMLElement>(`button[data-k="${bubble}"]`);
        const parent = navRef.current.parentElement;
        if (!b || !parent) return 0;
        const r = b.getBoundingClientRect();
        return r.top + r.height / 2 - parent.getBoundingClientRect().top - 28;
    }, [bubble]);

    return (
        <div className={styles.container} ref={containerRef}>
            {children}
            {keys && keys.length > 0 && (
                <>
                    <div
                        aria-label="Alphabet index"
                        className={clsx(styles.index, dragging && styles.dragging)}
                        onLostPointerCapture={endDrag}
                        onPointerCancel={endDrag}
                        onPointerDown={onPointerDown}
                        onPointerLeave={() => {
                            if (!dragging) {
                                pointerY.current = null;
                                kick();
                            }
                        }}
                        onPointerMove={onPointerMove}
                        onPointerUp={endDrag}
                        ref={navRef}
                        role="navigation"
                    >
                        {letters.map((k) => {
                            const present = firstIndex.has(k);
                            return (
                                <button
                                    aria-label={`Jump to ${k === '#' ? 'numbers and symbols' : k}`}
                                    className={clsx(
                                        styles.letter,
                                        !present && styles.empty,
                                        k === active && styles.active,
                                    )}
                                    data-k={k}
                                    disabled={!present}
                                    key={k}
                                    onClick={(e) => {
                                        // Keyboard activation; pointer clicks are handled on pointerdown
                                        if (e.detail === 0) jump(k);
                                    }}
                                    type="button"
                                >
                                    {k}
                                </button>
                            );
                        })}
                    </div>
                    <div
                        aria-hidden="true"
                        className={clsx(styles.bubble, bubble && styles.visible)}
                        style={{ transform: `translate3d(0,${bubbleTop}px,0)` }}
                    >
                        {bubble}
                    </div>
                </>
            )}
        </div>
    );
};
