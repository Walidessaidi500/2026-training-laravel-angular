import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { TpvNumericKeypadComponent } from '../tpv-numeric-keypad/tpv-numeric-keypad.component';
import { addIcons } from 'ionicons';
import { peopleOutline } from 'ionicons/icons';

@Component({
  selector: 'app-tpv-diners-modal',
  templateUrl: './tpv-diners-modal.component.html',
  styleUrls: ['./tpv-diners-modal.component.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule, TpvNumericKeypadComponent]
})
export class TpvDinersModalComponent {
  @Input() isOpen = false;
  @Input() tempDiners: string = '1';

  @Output() close = new EventEmitter<void>();
  @Output() confirm = new EventEmitter<void>();
  @Output() digitClick = new EventEmitter<string>();
  @Output() backspaceClick = new EventEmitter<void>();

  constructor() {
    addIcons({ peopleOutline });
  }

  onClose() { this.close.emit(); }
  onConfirm() { this.confirm.emit(); }
  onDigitClick(digit: string) { this.digitClick.emit(digit); }
  onBackspaceClick() { this.backspaceClick.emit(); }
}
