import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';

import { alphabetKey } from '/@/renderer/components/alphabet-index/alphabet-key';
import { albumQueries } from '/@/renderer/features/albums/api/album-api';
import { Album, AlbumListQuery, AlbumListSort } from '/@/shared/types/domain-types';

// Index letter of every album in the list, for alphabetical sorts only.
// Fetches the whole list once (cached), since the list itself loads in pages.
export const useAlbumAlphabetKeys = (
    query: Omit<AlbumListQuery, 'limit' | 'startIndex'>,
    serverId: string,
    itemCount: number,
): null | string[] => {
    const field: ((a: Album) => string) | null =
        query.sortBy === AlbumListSort.NAME || query.sortBy === AlbumListSort.SORT_NAME
            ? (a) => a.sortName || a.name
            : query.sortBy === AlbumListSort.ALBUM_ARTIST
              ? (a) => a.albumArtistName
              : null;

    const { data } = useQuery({
        ...albumQueries.list({
            query: { ...query, limit: itemCount, startIndex: 0 },
            serverId,
        }),
        enabled: !!field && itemCount > 0,
        staleTime: 1000 * 60 * 5,
    });

    return useMemo(() => {
        if (!field || !data?.items) return null;
        return data.items.map((a) => alphabetKey(field(a)));
        // field only changes with sortBy
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [data, query.sortBy]);
};
