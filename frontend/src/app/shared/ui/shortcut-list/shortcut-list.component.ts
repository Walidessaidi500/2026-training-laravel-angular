import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';

export interface ShortcutItem {
  id: string;
  icon: string;
  iconColor: string;
  title: string;
  description: string;
}

@Component({
  selector: 'app-shortcut-list',
  standalone: true,
  imports: [CommonModule, IonicModule],
  templateUrl: './shortcut-list.component.html',
  styleUrls: ['./shortcut-list.component.scss']
})
export class ShortcutListComponent {
  @Input() shortcuts: ShortcutItem[] = [];
  @Input() label: string = 'SHORTCUTS';
  @Output() shortcutClick = new EventEmitter<string>();

  onShortcutClick(id: string) {
    this.shortcutClick.emit(id);
  }
}
