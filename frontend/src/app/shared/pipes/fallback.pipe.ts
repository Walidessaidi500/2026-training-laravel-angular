import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'fallback',
  standalone: true
})
export class FallbackPipe implements PipeTransform {
  transform(value: string | null | undefined, defaultValue: string = 'Sin asignar'): string {
    return value && value.trim() !== '' ? value : defaultValue;
  }
}
