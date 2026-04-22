import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'activeStatus',
  standalone: true
})
export class ActiveStatusPipe implements PipeTransform {
  transform(active: boolean): string {
    return active ? 'ACTIVO' : 'INACTIVO';
  }
}
