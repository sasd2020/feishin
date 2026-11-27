import { UseSuspenseQueryOptions } from '@tanstack/react-query';

import { api } from '/@/renderer/api';
import { AlphabetIndex } from '/@/renderer/components/alphabet-index/alphabet-index';
import { useAlphabetIndex } from '/@/renderer/components/alphabet-index/use-alphabet-index';
import { useItemListInfiniteLoader } from '/@/renderer/components/item-list/helpers/item-list-infinite-loader';
import { useGridRows } from '/@/renderer/components/item-list/helpers/use-grid-rows';
import { useItemListScrollPersist } from '/@/renderer/components/item-list/helpers/use-item-list-scroll-persist';
import { ItemGridList } from '/@/renderer/components/item-list/item-grid-list/item-grid-list';
import { ItemListGridComponentProps } from '/@/renderer/components/item-list/types';
import { artistsQueries } from '/@/renderer/features/artists/api/artists-api';
import { useAlbumArtistAlphabetKeys } from '/@/renderer/features/artists/hooks/use-album-artist-alphabet-keys';
import { useGeneralSettings } from '/@/renderer/store';
import {
    AlbumArtistListQuery,
    AlbumArtistListSort,
    LibraryItem,
    SortOrder,
} from '/@/shared/types/domain-types';
import { ItemListKey } from '/@/shared/types/types';

interface AlbumArtistListInfiniteGridProps extends ItemListGridComponentProps<AlbumArtistListQuery> {}

export const AlbumArtistListInfiniteGrid = ({
    gap = 'md',
    itemsPerPage = 100,
    itemsPerRow,
    query = {
        sortBy: AlbumArtistListSort.NAME,
        sortOrder: SortOrder.ASC,
    },
    saveScrollOffset = true,
    serverId,
    size,
}: AlbumArtistListInfiniteGridProps) => {
    const listCountQuery = artistsQueries.albumArtistListCount({
        query: { ...query, limit: itemsPerPage },
        serverId: serverId,
    }) as UseSuspenseQueryOptions<number, Error, number, readonly unknown[]>;

    const listQueryFn = api.controller.getAlbumArtistList;

    const {
        dataVersion,
        getItem,
        getItemIndex,
        getLoadedItems,
        itemCount,
        loadedItems,
        onRangeChanged,
    } = useItemListInfiniteLoader({
        eventKey: ItemListKey.ALBUM_ARTIST,
        itemsPerPage,
        itemType: LibraryItem.ALBUM_ARTIST,
        listCountQuery,
        listQueryFn,
        query,
        serverId,
    });

    const { handleOnScrollEnd, scrollOffset } = useItemListScrollPersist({
        enabled: saveScrollOffset,
    });

    const rows = useGridRows(LibraryItem.ALBUM_ARTIST, ItemListKey.ALBUM_ARTIST, size);
    const { enableGridMultiSelect } = useGeneralSettings();

    const alphabetKeys = useAlbumArtistAlphabetKeys(query, serverId, itemCount);
    const { handleRangeChanged, indexRef, listRef, onJump } = useAlphabetIndex(onRangeChanged);

    return (
        <AlphabetIndex keys={alphabetKeys} onJump={onJump} ref={indexRef}>
            <ItemGridList
                data={loadedItems}
                dataVersion={dataVersion}
                enableMultiSelect={enableGridMultiSelect}
                gap={gap}
                getItem={getItem}
                getItemIndex={getItemIndex}
                getLoadedItems={getLoadedItems}
                initialTop={{
                    to: scrollOffset ?? 0,
                    type: 'offset',
                }}
                itemCount={itemCount}
                itemsPerRow={itemsPerRow}
                itemType={LibraryItem.ALBUM_ARTIST}
                onRangeChanged={handleRangeChanged}
                onScrollEnd={handleOnScrollEnd}
                ref={listRef}
                rows={rows}
                size={size}
            />
        </AlphabetIndex>
    );
};
