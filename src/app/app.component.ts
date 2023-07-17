import { Component } from '@angular/core'
import { PlaylistService } from './playlist.service'
import { NewTrack, Track } from './types'
import { tap } from 'rxjs'

@Component({
  selector: 'app-root',
  template: `
    <main>
      <h1>Lecteur de musique</h1>
      <div class="section">
        <h2>Ajouter une musique</h2>
        <app-track-form (newTrack)="addTrack($event)"></app-track-form>
      </div>
      <div class="section">
        <h2>Liste de lecture</h2>
        <app-playlist 
          [playlist]="(playlist$ | async)!"
          [playing]="(playing$ | async)!"
          (delete)="removeTrack($event)" 
          (play)="playTrack($event)" 
          (download)="downloadTrack($event)">
        </app-playlist>
      </div>
      <div class="section">
          <app-player 
            (stop)="stopTrack()" 
            (ended)="nextTrack()"
            [playing]="(playing$ | async)!">
          </app-player>
      </div>
    </main>
  `,
  styles: [
    `
      .section {
        margin-bottom: 16px;
      }

      h1, h2 {
        margin: 0;
        margin-bottom: 8px;
      }
    `
  ]
})
export class AppComponent {

  readonly playlist$ = this.playlistService.playlist$

  readonly playing$ = this.playlistService.playing$
  
  constructor(private readonly playlistService: PlaylistService){}

  addTrack(track: NewTrack): void {
    this.playlistService.add(track)
  }

  removeTrack(i: number): void {
    this.playlistService.remove(i)
  }

  downloadTrack(track: Track): void {
    this.playlistService.download(track)
  }

  playTrack(track: Track): void {
    this.playlistService.play(track)
  }

  stopTrack(): void {
    this.playlistService.stop()
  }

  nextTrack(): void {
    this.playlistService.next()
  }
}
