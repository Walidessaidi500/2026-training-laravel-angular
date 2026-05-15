import { Component, OnInit, inject } from '@angular/core';
import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonContent,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButtons,
  IonBackButton,
  IonList,
  IonItem,
  IonLabel,
  IonIcon,
  IonDatetime,
  IonPopover,
  IonButton,
  IonSpinner,
  ModalController
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { calendarOutline, receiptOutline, chevronForwardOutline, funnelOutline } from 'ionicons/icons';
import { SaleService, Sale } from '@services/domain/sale.service';
import { AdminDashboardFacade } from '@app/core/facades/admin-dashboard.facade';
import { SaleDetailModalComponent } from '@components/sale-detail-modal/sale-detail-modal.component';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-sales',
  templateUrl: './sales.page.html',
  styleUrls: ['./sales.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    CurrencyPipe,
    DatePipe,
    IonContent,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonButtons,
    IonBackButton,
    IonList,
    IonItem,
    IonLabel,
    IonIcon,
    IonDatetime,
    IonPopover,
    IonButton,
    IonSpinner
  ]
})
export class SalesPage implements OnInit {
  private readonly saleService = inject(SaleService);
  private readonly facade = inject(AdminDashboardFacade);
  private readonly modalCtrl = inject(ModalController);

  public sales: Sale[] = [];
  public isLoading = false;
  public selectedDate: string = new Date().toISOString();
  
  private tables: any[] = [];
  private users: any[] = [];
  private products: any[] = [];

  constructor() {
    addIcons({
      calendarOutline,
      receiptOutline,
      chevronForwardOutline,
      funnelOutline
    });
  }

  async ngOnInit() {
    this.loadData();
    
    this.tables = await firstValueFrom(this.facade.getTables());
    this.users = await firstValueFrom(this.facade.getUsers());
    this.products = await firstValueFrom(this.facade.getProducts());
  }

  loadData() {
    this.isLoading = true;
    const dateStr = this.selectedDate.split('T')[0];
    this.saleService.list(1, 100, dateStr).subscribe({
      next: (res) => {
        this.sales = res.data;
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
      }
    });
  }

  onDateChange(event: any) {
    this.selectedDate = event.detail.value;
    this.loadData();
  }

  async verDetalle(sale: Sale) {
    const modal = await this.modalCtrl.create({
      component: SaleDetailModalComponent,
      cssClass: 'sale-detail-modal',
      componentProps: {
        sale: sale,
        products: this.products,
        tables: this.tables,
        users: this.users
      }
    });
    await modal.present();
  }
}
