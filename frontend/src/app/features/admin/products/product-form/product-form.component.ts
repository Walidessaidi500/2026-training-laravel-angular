import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RouterModule, Router, ActivatedRoute } from '@angular/router';
import { 
  IonHeader, IonToolbar, IonTitle, IonContent, 
  IonList, IonItem, IonLabel, IonInput, IonButton, IonIcon, 
  IonSelect, IonSelectOption, IonToggle, IonButtons, IonBackButton
} from '@ionic/angular/standalone';
import { ProductService, Product } from '../../../../services/backoffice/product.service';
import { FamilyService, Family } from '../../../../services/backoffice/family.service';
import { TaxService, Tax } from '../../../../services/backoffice/tax.service';
import { addIcons } from 'ionicons';
import { saveOutline, arrowBackOutline, cameraOutline } from 'ionicons/icons';

@Component({
  selector: 'app-product-form',
  templateUrl: './product-form.component.html',
  styleUrls: ['./product-form.component.scss'],
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, RouterModule,
    IonHeader, IonToolbar, IonTitle, IonContent, 
    IonList, IonItem, IonLabel, IonInput, IonButton, IonIcon, 
    IonSelect, IonSelectOption, IonToggle, IonButtons, IonBackButton
  ]
})
export class ProductFormComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly productService = inject(ProductService);
  private readonly familyService = inject(FamilyService);
  private readonly taxService = inject(TaxService);

  form!: FormGroup;
  isEdit = false;
  uuid?: string;
  families: Family[] = [];
  taxes: Tax[] = [];

  constructor() {
    addIcons({ saveOutline, arrowBackOutline, cameraOutline });
    this.initForm();
  }

  ngOnInit() {
    this.loadDependencies();
    this.uuid = this.route.snapshot.params['uuid'];
    if (this.uuid) {
      this.isEdit = true;
      this.loadProduct();
    }
  }

  private initForm() {
    this.form = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      familyUuid: ['', [Validators.required]],
      taxUuid: ['', [Validators.required]],
      price: [0, [Validators.required, Validators.min(0)]],
      stock: [0, [Validators.required, Validators.min(0)]],
      active: [true],
      imageSrc: ['']
    });
  }

  private loadDependencies() {
    this.familyService.getFamilies().subscribe(data => this.families = data);
    this.taxService.getTaxes().subscribe(data => this.taxes = data);
  }

  private loadProduct() {
    if (!this.uuid) return;
    this.productService.getProduct(this.uuid).subscribe(product => {
      this.form.patchValue({
        name: product.name,
        familyUuid: product.familyUuid,
        taxUuid: product.taxUuid,
        price: product.price / 100, // Frontend trabaja en euros
        stock: product.stock,
        active: product.active,
        imageSrc: product.imageSrc
      });
    });
  }

  save() {
    if (this.form.invalid) return;

    const data = { ...this.form.value };
    data.price = Math.round(data.price * 100); // Backend en céntimos

    if (this.isEdit && this.uuid) {
      this.productService.updateProduct(this.uuid, data).subscribe(() => {
        this.router.navigate(['/backoffice/products']);
      });
    } else {
      this.productService.createProduct(data).subscribe(() => {
        this.router.navigate(['/backoffice/products']);
      });
    }
  }
}

