import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { 
  IonHeader, IonToolbar, IonTitle, IonContent, 
  IonList, IonItem, IonLabel, IonButton, IonIcon, 
  IonButtons
} from '@ionic/angular/standalone';
import { TaxService, Tax } from '../../../../services/backoffice/tax.service';
import { addIcons } from 'ionicons';
import { addOutline, createOutline, trashOutline, receiptOutline } from 'ionicons/icons';

@Component({
  selector: 'app-tax-list',
  templateUrl: './tax-list.component.html',
  styleUrls: ['./tax-list.component.scss'],
  standalone: true,
  imports: [
    CommonModule, 
    RouterModule,
    IonHeader, IonToolbar, IonTitle, IonContent, 
    IonList, IonItem, IonLabel, IonButton, IonIcon, 
    IonButtons
  ]
})
export class TaxListComponent implements OnInit {
  private readonly taxService = inject(TaxService);
  
  taxes: Tax[] = [];

  constructor() {
    addIcons({ addOutline, createOutline, trashOutline, receiptOutline });
  }

  ngOnInit() {
    this.loadTaxes();
  }

  loadTaxes() {
    this.taxService.getTaxes().subscribe(data => this.taxes = data);
  }

  deleteTax(uuid: string) {
    if (confirm('¿Estás seguro de que deseas eliminar este impuesto?')) {
      this.taxService.deleteTax(uuid).subscribe(() => {
        this.loadTaxes();
      });
    }
  }
}

