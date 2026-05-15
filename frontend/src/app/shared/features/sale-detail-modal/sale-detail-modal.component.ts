import { Component, Input, OnInit, CUSTOM_ELEMENTS_SCHEMA, inject } from '@angular/core';
import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import {
  IonHeader, IonToolbar, IonTitle, IonContent, IonItem,
  IonLabel, IonButton, IonButtons, IonIcon, IonList, IonNote, ModalController
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { closeOutline, receiptOutline } from 'ionicons/icons';

@Component({
  selector: 'app-sale-detail-modal',
  templateUrl: './sale-detail-modal.component.html',
  styleUrls: ['./sale-detail-modal.component.scss'],
  standalone: true,
  imports: [
    CommonModule, CurrencyPipe, DatePipe, IonHeader, IonToolbar, IonTitle,
    IonContent, IonItem, IonLabel, IonButton,
    IonButtons, IonIcon, IonList, IonNote
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class SaleDetailModalComponent implements OnInit {
  @Input() sale: any;
  @Input() products: any[] = [];
  @Input() tables: any[] = [];
  @Input() users: any[] = [];
  
  private readonly modalCtrl = inject(ModalController);

  constructor() {
    addIcons({
      'close-outline': closeOutline,
      'receipt-outline': receiptOutline
    });
  }

  ngOnInit() {}

  getProductName(productUuid: string): string {
    const product = this.products.find(p => p.uuid === productUuid);
    return product ? product.name : 'Producto desconocido';
  }

  getTableName(tableUuid: string): string {
    const table = this.tables.find(t => t.uuid === tableUuid);
    return table ? table.name : 'Mesa desconocida';
  }

  getUserName(userUuid: string): string {
    if (!userUuid) return 'N/A';
    const user = this.users.find(u => u.uuid === userUuid);
    return user ? user.name : 'Usuario desconocido';
  }

  dismiss() {
    this.modalCtrl.dismiss();
  }
}
