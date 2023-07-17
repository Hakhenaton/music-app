import { Component, EventEmitter, Input, Output } from '@angular/core'
import { Playlist, Track } from './types'

/**
 * Composant de présentation de la liste de lecture.
 */
@Component({
    selector: 'app-playlist',
    template: `
        <p *ngIf="playlist.length === 0">
            Votre liste de lecture est vide.
        </p>
        <ul id="playlist">
            <li class="playlist-item" *ngFor="let track of playlist; let i = index;">
                <strong>
                    <ng-container *ngIf="track.type === 'local'">
                        {{ track.name }}
                    </ng-container>
                    <ng-container *ngIf="track.type === 'remote'">
                        {{ track.url }}
                    </ng-container>
                    <span *ngIf="playing && track.id === playing.id">(En lecture)</span>
                </strong>
                <button (click)="play.emit(track)">Jouer</button>
                <button (click)="download.emit(track)">Télécharger</button>
                <button (click)="delete.emit(i)">Supprimer</button>
            </li>
        </ul>
    `,
    styles: [
        `
            #playlist {
                max-height: 500px;
                display: block;
                list-style: none;
                list-style-type: none;
                padding: 0;
                margin: 0;
                overflow-y: scroll;
            }
            .playlist-item:first-child {
                border-top: 1px solid black;
            }
            .playlist-item {
                border-bottom: 1px solid black;
                display: flex;
                flex-direction: row;
                padding: 16px;
                align-items: center;
                justify-content: space-around;
            }
        `
    ]
})
export class PlaylistComponent {

    /** La liste de lecture */
    @Input()
    playlist: Playlist = []

    /** Une piste en cours de lecture. Si présente dans la liste, elle sera annotée avec "(En lecture)" */
    @Input()
    playing?: Track

    /** Un clic sur le bouton supprimé a eu lieu sur l'élément d'index fourni */
    @Output()
    readonly delete = new EventEmitter<number>()

    /** Un clic sur le bouton play a eu lieu sur la piste */
    @Output()
    readonly play = new EventEmitter<Track>()

    /** Un clic sur le bouton download a eu lieu sur la piste */
    @Output()
    readonly download = new EventEmitter<Track>()
}