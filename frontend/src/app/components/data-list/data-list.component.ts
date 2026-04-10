import { Component, Input, TemplateRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';

@Component({
  selector: 'app-data-list',
  standalone: true,
  imports: [CommonModule, IonicModule],
  templateUrl: './data-list.component.html',
  styleUrls: ['./data-list.component.scss']
})
export class DataListComponent {
  @Input() items: any[] = [];
  @Input() label: string = 'LISTADO';
  @Input() title: string = '';
  @Input() emptyTitle: string = 'No hay elementos';
  @Input() emptyDescription: string = 'No se encontraron resultados.';
  @Input() emptyIcon: string = 'list-outline';
  
  // Accepts a custom template for rendering each row
  @Input() itemTemplate!: TemplateRef<any>;
}
