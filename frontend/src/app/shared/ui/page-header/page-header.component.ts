import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';

@Component({
  selector: 'app-page-header',
  standalone: true,
  imports: [CommonModule, IonicModule],
  templateUrl: './page-header.component.html',
  styleUrls: ['./page-header.component.scss']
})
export class PageHeaderComponent {
  @Input() title: string = '';
  @Input() subtitle: string = '';
  @Input() buttonText: string = '';
  @Input() buttonIcon: string = 'add';
  @Input() showButton: boolean = true;
  @Input() isLoading: boolean = false;
  
  @Output() actionClick = new EventEmitter<void>();

  onActionClick() {
    this.actionClick.emit();
  }
}
