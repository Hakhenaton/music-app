import { NgModule } from '@angular/core'
import { AppComponent } from './app.component'
import { BrowserModule } from '@angular/platform-browser'
import { ReactiveFormsModule } from '@angular/forms'
import { PlaylistComponent } from './playlist.component'
import { AddTrackFormComponent } from './add-track-form.component'
import { HttpClientModule } from '@angular/common/http'
import { LetModule } from '@ngrx/component'
import { PlayerComponent } from './player.component'

@NgModule({
    declarations: [
        AppComponent,
        PlaylistComponent,
        AddTrackFormComponent,
        PlayerComponent
    ],
    imports: [
        BrowserModule,
        ReactiveFormsModule,
        LetModule
    ],
    bootstrap: [AppComponent]
})
export class AppModule {}