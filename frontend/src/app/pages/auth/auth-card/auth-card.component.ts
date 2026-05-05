import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardComponent } from '@ui/card/card.component';
import { ButtonComponent } from '@ui/button/button.component';

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
  @Input() buttonDisabled: boolean = false;
  @Input() buttonType: 'button' | 'submit' = 'button';
  @Input() isLoading: boolean = false;
  @Input() cardClass: string = '';
  @Output() buttonClick = new EventEmitter<void>();

  onButtonClick(): void {
    this.buttonClick.emit();
  }
}
