import { Component, EventEmitter, OnInit, Output } from '@angular/core'
import { NewTrack, Track } from './types'
import { FormBuilder, FormControl, FormGroup } from '@angular/forms'
import { FileValidator } from './validators/file.validator'
import { UrlValidator } from './validators/url.validator'

// modes d'ajout de fichier avec données associées
const modes = [
    {
        name: 'local',
        label: 'Depuis un fichier'
    },
    {
        name: 'remote',
        label: 'Depuis une URL'
    }
] as const

// types de fichier supportés
const supportedTypes = [
    'audio/mpeg',
    'audio/ogg',
    'audio/wav'
] as const

// type distinguant un mode d'utilisation du formulaire
type AddTrackFormMode = typeof modes[number]['name']

// type du FormGroup représentant le formulaire
type AddTrackFormGroup = {
    mode: FormControl<AddTrackFormMode | null>,
    url?: FormControl<string | null>,
    file?: FormControl<File | null>
}

@Component({
    selector: 'app-track-form',
    template: `
        <form [formGroup]="form" (ngSubmit)="submit()">
            <div class="field">
                <label for="mode">Mode d'ajout</label>
                <select id="mode" formControlName="mode">
                    <option [value]="mode.name" *ngFor="let mode of modes">
                        {{ mode.label }}
                    </option>
                </select>
            </div>
            <div class="field">
                <ng-container *ngIf="form.controls['mode'].value === 'local'">
                    <label for="file">Sélectionnez un fichier audio</label>
                    <div *ngIf="form.controls['file']!.dirty && form.controls['file']!.invalid">
                        Le fichier est invalide ({{ form.controls['file']!.errors!['invalid-file'].cause }}).
                    </div>
                    <input id="file" type="file" (change)="setFileValue($event)">
                </ng-container>
                <ng-container *ngIf="form.controls['mode'].value === 'remote'">
                    <label for="url">Entrez une URL</label>
                    <div *ngIf="form.controls['url']!.dirty && form.controls['url']!.invalid">
                        L'URL est invalide ({{ form.controls['url']!.errors!['invalid-url'].cause }}).
                    </div>
                    <input id="url" type="text" formControlName="url">
                </ng-container>
            </div>
            <button type="submit" [disabled]="form.invalid">Ajouter</button>
        </form>
    `,
    styles: [
        `
            .field {
                display: flex;
                flex-direction: column;
                margin-bottom: 8px;
            }
        `
    ],
    /** Ces validateurs doivent être enregistrés au niveau de chaque composant car ils ne sont pas sans-état. */
    providers: [
        FileValidator,
        UrlValidator
    ]
})
export class AddTrackFormComponent implements OnInit {

    @Output()
    readonly newTrack = new EventEmitter<NewTrack>()

    form!: FormGroup<AddTrackFormGroup>

    readonly modes = modes

    constructor(
        private readonly formBuilder: FormBuilder,
        private readonly trackFileValidator: FileValidator,
        private readonly trackUrlValidator: UrlValidator
    ){
        this.trackUrlValidator.allowedProtocols = ['http', 'https'] // on ne traite que des URLs HTTP
        this.trackFileValidator.allowedTypes = supportedTypes
        this.trackFileValidator.sizeLimit = Math.pow(2, 20) * 100 // 100 mb maximum 

    }

    ngOnInit(): void {
        // mode par défaut sera 'local'
        const mode = this.formBuilder.control('local' as AddTrackFormMode)
        this.form = this.formBuilder.group({ mode })
        // mettre en place le mode sélectionné par défaut
        this.setupControls()
        // réagir aux changements de mode
        this.form.controls['mode'].valueChanges.subscribe(() => this.setupControls())
    }

    /**
     * Les <input type="file"> n'ont pas d'objet File en tant que valeur de contrôle quand on utilise Reactive Forms.
     * Il faut manuellement gérer l'événement du DOM onchange sur le champ pour injecter l'objet File dans le contrôle Angular.
     * Cela est fait programmatiquement avec setValue() et markAsDirty().
     */
    setFileValue(event: Event){
        const input = event.target as HTMLInputElement
        this.form.controls['file']!.setValue(input.files![0])
        this.form.controls['file']!.markAsDirty()
    }

    /** Emet l'objet en sortie et réinitialise le formulaire */
    submit(): void {
        this.newTrack.emit(this.getTrack())
        this.form.reset(
            { mode: this.form.controls['mode'].value }, 
            { emitEvent: false }
        )
    }

    private setupControls(){

        // On retire le contrôle actuel
        const controlNamesToRemove = Object.keys(this.form.controls)
            .filter(key => key !== 'mode') as readonly (keyof Omit<AddTrackFormGroup, 'mode'>)[]
        for (const control of controlNamesToRemove){
            if (control in this.form.controls){
                this.form.removeControl(control)
                break
            }
        }

        // Ajout du contrôle spécifique en fonction du monde
        switch(this.form.controls['mode'].value!){
            case 'local':
                const fileControl: FormControl<File|null> = this.formBuilder.control(
                    null, 
                    control => this.trackFileValidator.validate(control)
                )
                this.form.addControl('file', fileControl)
                break
            case 'remote':
                this.form.addControl(
                    'url', 
                    this.formBuilder.control(
                        null, 
                        control => this.trackUrlValidator.validate(control)
                    )
                )
                break
        }
    }

    private getTrack(): NewTrack {
        switch (this.form.controls['mode'].value!){
            case 'local':
                const file = this.form.controls['file']!.value!
                return {
                    type: 'local',
                    name: file.name,
                    // on créé une URL qui pointe vers le fichier local
                    url: new URL(URL.createObjectURL(file))
                }
            case 'remote':
                return {
                    type: 'remote',
                    url: new URL(this.form.controls['url']!.value!)
                }
        }
    }
}