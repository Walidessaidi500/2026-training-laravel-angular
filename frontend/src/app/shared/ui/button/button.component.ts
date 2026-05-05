import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonButton, IonSpinner } from '@ionic/angular/standalone';

@Component({
  selector: 'app-button',
  templateUrl: './button.component.html',
  styleUrls: ['./button.component.scss'],
  standalone: true,
  imports: [CommonModule, IonButton, IonSpinner],
})
export class ButtonComponent {
  @Input() label: string = '';
  @Input() color: string = 'primary';
  @Input() expand: string = 'block';
  @Input() type: 'button' | 'submit' = 'button';
  @Input() disabled: boolean = false;
  @Input() isLoading: boolean = false;
  @Output() buttonClick = new EventEmitter<void>();

  onClick(): void {
    if (!this.isLoading) {
      this.buttonClick.emit();
    }
  }
}
