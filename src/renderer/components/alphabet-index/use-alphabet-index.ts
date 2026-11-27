import { useCallback, useRef } from 'react';

import { AlphabetIndexHandle } from '/@/renderer/components/alphabet-index/alphabet-index';
import { ItemListHandle } from '/@/renderer/components/item-list/types';

type Range = { startIndex: number; stopIndex: number };

// Connects a list (grid or table) to an AlphabetIndex without re-rendering
// the list while scrolling.
export const useAlphabetIndex = (onRangeChanged?: (range: Range) => void) => {
    const listRef = useRef<ItemListHandle>(null);
    const indexRef = useRef<AlphabetIndexHandle>(null);

    const handleRangeChanged = useCallback(
        (range: Range) => {
            indexRef.current?.setStartIndex(range.startIndex);
            onRangeChanged?.(range);
        },
        [onRangeChanged],
    );

    const onJump = useCallback((index: number) => {
        listRef.current?.scrollToIndex(index, { align: 'top' });
    }, []);

    return { handleRangeChanged, indexRef, listRef, onJump };
};
