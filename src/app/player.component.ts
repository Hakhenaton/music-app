import { AfterViewInit, ChangeDetectorRef, Component, ElementRef, EventEmitter, Input, OnChanges, Output, SimpleChanges, ViewChild } from '@angular/core'
import { Observable, filter, fromEvent, map } from 'rxjs'
import { Track } from './types'


/**
 * Composant représent le lecteur de musique.
 */
@Component({
    selector: 'app-player',
    template: `
        <div id="player">
            
            <audio (ended)="ended()" #audio>
                <source *ngIf="playing" [attr.src]="playing.url"/>
            </audio>
            
            <ng-container *ngIf="playback$">
                <ng-container *ngrxLet="playback$ as time">
                    <div #timeline id="timeline" (click)="seek($event)">
                        <div id="elapsed" [ngStyle]="{ 
                            'width': ((time.elapsed / time.duration) * 100) + '%' 
                        }">
                        </div>
                    </div>
                    <div id="timer">
                        {{ time.elapsed + '/' + time.duration + 's' }}
                    </div>
                </ng-container>
            </ng-container>

            <div id="controls" *ngIf="audio && playing">
                <button [disabled]="!audio.paused" (click)="resume()">Play</button>
                <button [disabled]="audio.paused" (click)="pause()">Pause</button>
                <button (click)="stop()">Stop</button>
            </div>
            
        </div>
    `,
    styles: [
        `
            #player {
                display: flex;
                flex-direction: column;
                justify-content: center;
            }

            #timeline {
                cursor: pointer;
                width: 100%;
                height: 16px;
                display: flex;
                flex-direction: row;
                border: 1px solid black;
            }

            #elapsed {
                background-color: black;
                height: 100%;
            }

            #controls {
                display: flex;
                flex-direction: row;
                align-items: center;
                justify-content: center;
            }
        `
    ]
})
export class PlayerComponent implements AfterViewInit, OnChanges {

    /** La piste chargée dans le lecteur. null si aucune piste n'est chargée.  */
    @Input()
    playing: Track | null = null

    /** 
     * Un observable construit à partir des événements du DOM de type "timeupdate" sur notre élément <audio>. 
     * Cette observable sera non défini si la piste n'est pas en cours de lecture.
     * */
    playback$?: Observable<Readonly<{ elapsed: number, duration: number }>>

    /** ElementRef pointant vers l'élément <audio> natif */
    @ViewChild('audio')
    audioElementRef!: ElementRef<HTMLAudioElement>

    /** ElementRef pointant vers l'élément <div> représentant notre timeline  */
    @ViewChild('timeline')
    timeline!: ElementRef<HTMLDivElement>

    /** L'élément <audio> */
    audio!: HTMLAudioElement

    /** Evénement de clic sur le bouton stop */
    @Output('stop')
    readonly stopEvents = new EventEmitter<void>()

    /** Evénement de fin de piste. */
    @Output('ended')
    readonly endedEvents = new EventEmitter<void>()

    constructor(private readonly changeDetectorRef: ChangeDetectorRef) { }

    /** Ici, on réagit aux changements sur la propriété `playing` */
    ngOnChanges(changes: SimpleChanges): void {

        if (changes['playing'].isFirstChange())
            return

        /** Si null a été chargé */
        if (!this.playing) {
            /** On coupe le son si une piste était en cours de lecture */
            if (!this.audio!.paused)
                this.audio!.pause()
            /** On supprime l'observable du flux de lecture */
            delete this.playback$
            return
        }

        /** Si une piste a été chargée, on rafraichit l'état de l'élément <audio> pour qu'il prenne en compte le nouvel attribut "src" sur l'élément <source> */
        this.audio!.load()
        /** On lance la lecture */
        this.audio!.play()

        /** On créé l'observable de flux de lecture à partir de l'événement timeupdate du DOM. */
        this.playback$ = fromEvent(this.audio!, 'timeupdate')
            .pipe(
                filter(() => !isNaN(this.audio.duration)),
                map(() => ({
                    elapsed: Math.floor(this.audio!.currentTime),
                    duration: Math.floor(this.audio!.duration)
                }))
            )
    }

    /** On est obligés d'utiliser ChangeDetectorRef vu qu'on met à jour this.audio dans un hook où la détection de changement a déjà eu lieu (voir https://angular.io/errors/NG0100) */
    ngAfterViewInit(): void {
        this.audio = this.audioElementRef.nativeElement
        this.changeDetectorRef.detectChanges()
    }

    ended(): void {
        this.endedEvents.emit()
    }

    /** Résumer la lecture */
    resume(): void {
        this.audio!.play()
    }

    /** Mettre en pause la lecture */
    pause(): void {
        this.audio!.pause()
    }

    /** Déplacer la tête de lecture */
    seek(click: MouseEvent): void {
        const timeline = this.timeline.nativeElement
        const timelineRect = timeline.getBoundingClientRect()
        const { left: tLeft, right: tRight } = timelineRect
        const seeked = (click.clientX - tLeft) / (tRight - tLeft)
        this.audio!.currentTime = this.audio!.duration * seeked
    }

    stop(): void {
        this.stopEvents.emit()
    }
}