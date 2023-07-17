// https://www.typescriptlang.org/docs/handbook/2/conditional-types.html#distributive-conditional-types
type DistributiveOmit<T, K extends keyof any> = T extends any ? Omit<T, K> : never

/** Une piste de musique. */
export type Track = Readonly<
    | { type: 'remote', url: URL } 
    | { type: 'local', url: URL, name: string }
> & { id: string }

export type NewTrack = DistributiveOmit<Track, 'id'>

/** Une liste de lecture, autrement dit un ensemble ordonnés de pistes. */
export type Playlist = readonly Track[]