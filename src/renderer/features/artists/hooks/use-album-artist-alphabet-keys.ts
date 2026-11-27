import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';

import { alphabetKey } from '/@/renderer/components/alphabet-index/alphabet-key';
import { artistsQueries } from '/@/renderer/features/artists/api/artists-api';
import { AlbumArtistListQuery, AlbumArtistListSort } from '/@/shared/types/domain-types';

// Index letter of every album artist in the list, when sorted by name.
export const useAlbumArtistAlphabetKeys = (
    query: Omit<AlbumArtistListQuery, 'limit' | 'startIndex'>,
    serverId: string,
    itemCount: number,
): null | string[] => {
    const enabled = query.sortBy === AlbumArtistListSort.NAME;

    const { data } = useQuery({
        ...artistsQueries.albumArtistList({
            query: { ...query, limit: itemCount, startIndex: 0 },
            serverId,
        }),
        enabled: enabled && itemCount > 0,
        staleTime: 1000 * 60 * 5,
    });

    return useMemo(
        () => (enabled && data?.items ? data.items.map((a) => alphabetKey(a.name)) : null),
        [data, enabled],
    );
};
