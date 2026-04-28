import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { User } from '@services/domain/user.service';
import { TpvNumericKeypadComponent } from '../tpv-numeric-keypad/tpv-numeric-keypad.component';
import { addIcons } from 'ionicons';
import { backspaceOutline } from 'ionicons/icons';

@Component({
  selector: 'app-tpv-pin-modal',
  templateUrl: './tpv-pin-modal.component.html',
  styleUrls: ['./tpv-pin-modal.component.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule, TpvNumericKeypadComponent]
})
export class TpvPinModalComponent {
  @Input() isOpen = false;
  @Input() selectedUser: User | null = null;
  @Input() pinBuffer: string = '';

  @Output() close = new EventEmitter<void>();
  @Output() confirm = new EventEmitter<void>();
  @Output() digitClick = new EventEmitter<string>();
  @Output() backspaceClick = new EventEmitter<void>();

  constructor() {
    addIcons({ backspaceOutline });
  }

  onClose() { this.close.emit(); }
  onConfirm() { this.confirm.emit(); }
  onDigitClick(digit: string) { this.digitClick.emit(digit); }
  onBackspaceClick() { this.backspaceClick.emit(); }
}
