import { Injectable } from '@angular/core'
import { AbstractControl, Validator } from '@angular/forms'

/** Type représentant des erreurs de validation de fichier */
export type FileValidatorError = Readonly<
    |{
        cause: 'file-too-large'
        actual: number
        limit: number
    }
    |{
        cause: 'invalid-type'
        actual: string
        allowed: readonly string[]
    }
    |{
        cause: 'not-a-file'
    }
>

/** Validation d'objets de type File */
@Injectable()
export class FileValidator implements Validator {

    allowedTypes?: readonly string[]

    sizeLimit?: number
    
    validate(control: AbstractControl<unknown, unknown>): { 'invalid-file': FileValidatorError } | null {
        const { value: file } = control

        if (!(file instanceof File))
            // l'objet passé n'est pas un objet File
            return { 
                'invalid-file': { 
                    cause: 'not-a-file' 
                } 
            }

        if (this.sizeLimit !== undefined && file.size > this.sizeLimit)
            // fichier trop volumineux
            return { 
                'invalid-file': { 
                    cause: 'file-too-large', 
                    actual: file.size, 
                    limit: this.sizeLimit 
                } 
            }

        if (this.allowedTypes && !this.allowedTypes.includes(file.type))
            // type de fichier invalide
            return { 
                'invalid-file': { 
                    cause: 'invalid-type', 
                    actual: file.type, 
                    allowed: [...this.allowedTypes] 
                } 
            }
        
        return null
    }
}