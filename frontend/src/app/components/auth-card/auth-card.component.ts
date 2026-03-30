import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardComponent } from '../card/card.component';
import { ButtonComponent } from '../button/button.component';

@Component({
  selector: 'app-auth-card',
  templateUrl: './auth-card.component.html',
  styleUrls: ['./auth-card.component.scss'],
  standalone: true,
  imports: [CommonModule, CardComponent, ButtonComponent],
})
export class AuthCardComponent {
  @Input() title: string = '';
  @Input() description: string = '';
  @Input() buttonLabel: string = '';
  @Input() buttonColor: string = 'primary';
  @Output() buttonClick = new EventEmitter<void>();

  onButtonClick(): void {
    this.buttonClick.emit();
  }
}
