import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { addIcons } from 'ionicons';
import { backspaceOutline } from 'ionicons/icons';

@Component({
  selector: 'app-tpv-numeric-keypad',
  templateUrl: './tpv-numeric-keypad.component.html',
  styleUrls: ['./tpv-numeric-keypad.component.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule]
})
export class TpvNumericKeypadComponent {
  @Input() showEmptyButton = true;
  @Output() digitClick = new EventEmitter<string>();
  @Output() backspaceClick = new EventEmitter<void>();

  constructor() {
    addIcons({ backspaceOutline });
  }

  onDigitClick(digit: string) {
    this.digitClick.emit(digit);
  }

  onBackspaceClick() {
    this.backspaceClick.emit();
  }
}
