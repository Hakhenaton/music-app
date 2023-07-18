import { Inject, Injectable } from '@angular/core'
import { BehaviorSubject, Observable } from 'rxjs'
import { NewTrack, Playlist, Track } from './types'
import { DOCUMENT } from '@angular/common'

const idsAlphabet = [
    ...[...Array(10).keys()].map(i => i + '0'.charCodeAt(0)),
    ...[...Array(26).keys()].map(i => i + 'a'.charCodeAt(0)),
    ...[...Array(26).keys()].map(i => i + 'A'.charCodeAt(0))
].map(i => String.fromCharCode(i))

/**
 * A service that holds and in-memory list of tracks.
 */
@Injectable({ providedIn: 'root' })
export class PlaylistService {

    /** Représente une playlist qui change au fil du temps. */
    get playlist$(): Observable<Playlist> {
        return this._playlist$.asObservable()
    }

    /** Représente l'index de la piste en cours de lecture. Une valeur nulle signifie que le lecteur est stoppé.  */
    get playing$(): Observable<Track | null> {
        return this._playing$.asObservable()
    }

    /** 
     * Ces deux observables sont exposés via deux getters publics qui les convertissent en Observables purs. 
     * C'est une bonne pratique car cela permet d'éviter que les clients de ce service aient accès aux méthodes
     * du type BehaviorSubject.
     **/
    private readonly _playlist$ = new BehaviorSubject<Playlist>([])
    private readonly _playing$ = new BehaviorSubject<Track | null>(null)

    constructor(@Inject(DOCUMENT) private readonly document: Document){}

    /** Ajouter une piste à la playlist */
    add(track: NewTrack): void {
        this._playlist$.next([
            ...this._playlist$.value, 
            { ...track, id: this.generateId() }
        ])
    }

    /** Retirer une piste via son index */
    remove(i: number): void {

        const copy = [...this._playlist$.value]
        
        const [deleted] = copy.splice(i, 1)

        if (this._playing$.value?.id === deleted.id)
            this._playing$.next(null)

        if (deleted.type === 'local')
            URL.revokeObjectURL(deleted.url.toString())
        
        this._playlist$.next(copy)
    }

    /** Lire une piste. La valeur de playing$ sera mise à jour avec la piste passée en paramètre. */
    play(track: Track): void {
        this._playing$.next({ ...track })
    }

    /** Stop la lecture de la playlist. La valeur de playing$ sera mise à jour avec null. */
    stop(): void {
        this._playing$.next(null)
    }

    /** Télécharger une piste. */
    download(track: Track): void {
        
        const anchor = this.document.createElement('a')
        
        anchor.href = track.url.toString()
        anchor.download = this.getTrackName(track)
       
        this.document.body.appendChild(anchor)
        anchor.click()
        this.document.body.removeChild(anchor)
    }

    /** Passer à la piste suivante. 
     * La valeur de playing$ sera mise à jour avec la piste suivante dans la liste, ou alors la toute première si toutes les pistes ont été lues. 
     * */
    next(): void {
        
        if (this._playing$.value === null)
            return

        const index = this._playlist$.value.findIndex(track => track.id === this._playing$.value!.id)

        this._playing$.next({ ...this._playlist$.value[(index + 1) % this._playlist$.value.length] })
    }

    private getTrackName(track: Track): string {
        switch (track.type){
            case 'local':
                return track.name
            case 'remote':
                const pathSegments = track.url.pathname.substring(1).split('/')
                if (!pathSegments[pathSegments.length - 1])
                    throw Error(`could not get track name for ${track.url.toString()}`)
                return pathSegments[pathSegments.length - 1]
        }
    }

    private generateId(): string {
        return Array.from(window.crypto.getRandomValues(new Uint8Array(16)).map(i => i % idsAlphabet.length))
            .reduce((str, char) => str + idsAlphabet[char], '')
    }
}