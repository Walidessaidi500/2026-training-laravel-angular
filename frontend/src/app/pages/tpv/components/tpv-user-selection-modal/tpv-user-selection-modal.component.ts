import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { User } from '@services/domain/user.service';
import { addIcons } from 'ionicons';
import { personCircleOutline } from 'ionicons/icons';

@Component({
  selector: 'app-tpv-user-selection-modal',
  templateUrl: './tpv-user-selection-modal.component.html',
  styleUrls: ['./tpv-user-selection-modal.component.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule]
})
export class TpvUserSelectionModalComponent {
  @Input() isOpen = false;
  @Input() users: User[] = [];
  @Input() context: 'opening' | 'closing' = 'opening';

  @Output() close = new EventEmitter<void>();
  @Output() selectUser = new EventEmitter<User>();

  constructor() {
    addIcons({ personCircleOutline });
  }

  onClose() {
    this.close.emit();
  }

  onSelectUser(user: User) {
    this.selectUser.emit(user);
  }
}
