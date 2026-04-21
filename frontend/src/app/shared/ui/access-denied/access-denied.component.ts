import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonIcon } from '@ionic/angular/standalone';

@Component({
  selector: 'app-access-denied',
  standalone: true,
  imports: [CommonModule, IonIcon],
  templateUrl: './access-denied.component.html',
  styleUrls: ['./access-denied.component.scss'],
})
export class AccessDeniedComponent {

  @Input() user: any;
  @Input() message: string = 'Acceso Restringido.'


}
