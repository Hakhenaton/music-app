import { Injectable } from '@angular/core'
import { AbstractControl, Validator } from '@angular/forms'

/** Type représentant des erreurs de validation d'URL */
export type UrlValidatorError = Readonly<
    |{
        cause: 'parsing-error'
        error: Error
    }
    |{
        cause: 'forbidden-protocol'
        actual: string
        allowed: readonly string[]
    }
    |{
        cause: 'cannot-fetch-resource'
        url: URL,
        error: Error
    }
    |{
        cause: 'invalid-input-type'
        actual: string
        expected: 'string'
    }
    |{
        cause: 'invalid-content-type',
        actual?: string
        allowed: readonly string[]
    }
>

/** Validation d'URL fournies sous forme de chaîne de caractères */
@Injectable()
export class UrlValidator implements Validator {

    allowedProtocols?: readonly string[]

    validate(control: AbstractControl<unknown, unknown>): { 'invalid-url': UrlValidatorError } | null {

        if (typeof control.value !== 'string')
            // l'entrée n'est pas valide pour être traitée
            return {
                'invalid-url': {
                    cause: 'invalid-input-type',
                    actual: typeof control.value,
                    expected: 'string'
                }
            }

        let url: URL
        try {
            url = new URL(control.value)
        } catch (error){
            // la chaîne ne représente pas une URL
            return { 
                'invalid-url': { 
                    cause: 'parsing-error', 
                    error: error as Error
                } 
            }
        }
        
        // le protocole n'est pas autorisé
        if (this.allowedProtocols && !this.allowedProtocols.some(allowedProtocol => `${allowedProtocol.toLowerCase()}:` === url.protocol))
            return { 
                'invalid-url': { 
                    cause: 'forbidden-protocol', 
                    actual: url.protocol, 
                    allowed: this.allowedProtocols
                } 
            }
        
        return null
    }
}