import { UseSuspenseQueryOptions } from '@tanstack/react-query';

import { api } from '/@/renderer/api';
import { AlphabetIndex } from '/@/renderer/components/alphabet-index/alphabet-index';
import { useAlphabetIndex } from '/@/renderer/components/alphabet-index/use-alphabet-index';
import { useItemListInfiniteLoader } from '/@/renderer/components/item-list/helpers/item-list-infinite-loader';
import { useItemListColumnReorder } from '/@/renderer/components/item-list/helpers/use-item-list-column-reorder';
import { useItemListColumnResize } from '/@/renderer/components/item-list/helpers/use-item-list-column-resize';
import { useItemListScrollPersist } from '/@/renderer/components/item-list/helpers/use-item-list-scroll-persist';
import { ItemTableList } from '/@/renderer/components/item-list/item-table-list/item-table-list';
import { ItemTableListColumn } from '/@/renderer/components/item-list/item-table-list/item-table-list-column';
import { ItemListTableComponentProps } from '/@/renderer/components/item-list/types';
import { useListContext } from '/@/renderer/context/list-context';
import { albumQueries } from '/@/renderer/features/albums/api/album-api';
import { useAlbumAlphabetKeys } from '/@/renderer/features/albums/hooks/use-album-alphabet-keys';
import {
    AlbumListQuery,
    AlbumListSort,
    LibraryItem,
    SortOrder,
} from '/@/shared/types/domain-types';
import { ItemListKey } from '/@/shared/types/types';

interface AlbumListInfiniteTableProps extends ItemListTableComponentProps<AlbumListQuery> {}

export const AlbumListInfiniteTable = ({
    autoFitColumns = false,
    columns,
    enableAlternateRowColors = false,
    enableHeader = true,
    enableHorizontalBorders = false,
    enableRowHoverHighlight = true,
    enableSelection = true,
    enableVerticalBorders = false,
    itemsPerPage = 100,
    query = {
        sortBy: AlbumListSort.NAME,
        sortOrder: SortOrder.ASC,
    },
    saveScrollOffset = true,
    serverId,
    size = 'default',
}: AlbumListInfiniteTableProps) => {
    const listCountQuery = albumQueries.listCount({
        query: { ...query, limit: itemsPerPage },
        serverId: serverId,
    }) as UseSuspenseQueryOptions<number, Error, number, readonly unknown[]>;

    const listQueryFn = api.controller.getAlbumList;
    const { pageKey } = useListContext();

    const { getItem, getItemIndex, getLoadedItems, itemCount, loadedItems, onRangeChanged } =
        useItemListInfiniteLoader({
            eventKey: pageKey || ItemListKey.ALBUM,
            itemsPerPage,
            itemType: LibraryItem.ALBUM,
            listCountQuery,
            listQueryFn,
            query,
            serverId,
        });

    const { handleOnScrollEnd, scrollOffset } = useItemListScrollPersist({
        enabled: saveScrollOffset,
    });

    const { handleColumnReordered } = useItemListColumnReorder({
        itemListKey: ItemListKey.ALBUM,
    });

    const { handleColumnResized } = useItemListColumnResize({
        itemListKey: ItemListKey.ALBUM,
    });

    const alphabetKeys = useAlbumAlphabetKeys(query, serverId, itemCount);
    const { handleRangeChanged, indexRef, listRef, onJump } = useAlphabetIndex(onRangeChanged);

    return (
        <AlphabetIndex keys={alphabetKeys} onJump={onJump} ref={indexRef}>
            <ItemTableList
                autoFitColumns={autoFitColumns}
                CellComponent={ItemTableListColumn}
                columns={columns}
                data={loadedItems}
                enableAlternateRowColors={enableAlternateRowColors}
                enableHeader={enableHeader}
                enableHorizontalBorders={enableHorizontalBorders}
                enableRowHoverHighlight={enableRowHoverHighlight}
                enableSelection={enableSelection}
                enableVerticalBorders={enableVerticalBorders}
                getItem={getItem}
                getItemIndex={getItemIndex}
                getLoadedItems={getLoadedItems}
                initialTop={{
                    to: scrollOffset ?? 0,
                    type: 'offset',
                }}
                itemCount={itemCount}
                itemType={LibraryItem.ALBUM}
                onColumnReordered={handleColumnReordered}
                onColumnResized={handleColumnResized}
                onRangeChanged={handleRangeChanged}
                onScrollEnd={handleOnScrollEnd}
                ref={listRef}
                size={size}
            />
        </AlphabetIndex>
    );
};
