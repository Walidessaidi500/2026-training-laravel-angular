import { Injectable, inject } from '@angular/core';
import { BehaviorSubject, Observable, map } from 'rxjs';
import { Product, ProductOption } from '@services/domain/product.service';
import { Tax } from '@services/domain/tax.service';
import { Order, OrderService } from '@services/domain/order.service';
import { UiService } from '@app/core/services/ui/ui.service';

export interface CartItem {
  uuid?: string;
  product: Product;
  quantity: number;
  selected?: boolean;
  selectedQuantity?: number;
  option?: ProductOption;
}

@Injectable({
  providedIn: 'root'
})
export class CartService {
  private readonly orderService = inject(OrderService);
  private readonly uiService = inject(UiService);

  private readonly _cart = new BehaviorSubject<CartItem[]>([]);
  public readonly cart$ = this._cart.asObservable();

  private readonly _currentOrder = new BehaviorSubject<Order | null>(null);
  public readonly currentOrder$ = this._currentOrder.asObservable();

  private readonly _tempDiners = new BehaviorSubject<string>('1');
  public readonly tempDiners$ = this._tempDiners.asObservable();

  private taxes: Tax[] = [];

  public setTaxes(taxes: Tax[]) {
    this.taxes = taxes;
  }

  public get cartValue(): CartItem[] {
    return this._cart.value;
  }

  public get currentOrderValue(): Order | null {
    return this._currentOrder.value;
  }

  public get tempDinersValue(): string {
    return this._tempDiners.value;
  }

  public setCart(items: CartItem[]) {
    this._cart.next(items);
  }

  public setCurrentOrder(order: Order | null) {
    this._currentOrder.next(order);
    if (order) {
      this._tempDiners.next(order.diners.toString());
    }
  }

  public setTempDiners(diners: string) {
    this._tempDiners.next(diners);
  }

  public addDinerDigit(digit: string) {
    const current = this.tempDinersValue;
    if (current === '0') {
      this.setTempDiners(digit);
    } else {
      this.setTempDiners(current + digit);
    }
  }

  public removeDinerDigit() {
    const current = this.tempDinersValue;
    if (current.length > 1) {
      this.setTempDiners(current.slice(0, -1));
    } else {
      this.setTempDiners('0');
    }
  }

  public addToCart(product: Product, option?: ProductOption) {
    const currentCart = this.cartValue;
    
    // Calcular el impacto total actual en el carrito para este producto (todas las variantes)
    const totalImpactInCart = currentCart
      .filter(item => item.product.uuid === product.uuid)
      .reduce((sum, item) => sum + (item.quantity * (item.option ? item.option.stock_impact : 1.0)), 0);
    
    const newImpact = option ? option.stock_impact : 1.0;

    if (totalImpactInCart + newImpact > product.stock) {
      this.uiService.showError(`No queda suficiente stock de ${product.name}`);
      return;
    }

    const existingItem = currentCart.find(item => 
      item.product.uuid === product.uuid && 
      ( (!option && !item.option) || (option && item.option && item.option.name === option.name) )
    );

    if (existingItem) {
      existingItem.quantity++;
      this._cart.next([...currentCart]);
    } else {
      this._cart.next([...currentCart, { product, quantity: 1, selected: false, selectedQuantity: 0, option }]);
    }
  }

  public removeFromCart(index: number) {
    const currentCart = this.cartValue;
    if (currentCart[index].quantity > 1) {
      currentCart[index].quantity--;
      this._cart.next([...currentCart]);
    } else {
      const newCart = [...currentCart];
      newCart.splice(index, 1);
      this._cart.next(newCart);
    }
  }

  public clearCart() {
    this._cart.next([]);
    this._currentOrder.next(null);
    this._tempDiners.next('1');
  }

  public getPriceWithTax(product: Product, option?: ProductOption): number {
    const tax = this.taxes.find(t => t.uuid === product.tax_id);
    const percentage = tax ? tax.percentage : 0;
    const basePrice = product.priceInCents + (option ? option.price_change : 0);
    return basePrice * (1 + percentage / 100);
  }

  public getTotal(): number {
    return this.cartValue.reduce((sum, item) => sum + (this.getPriceWithTax(item.product, item.option) * item.quantity), 0);
  }

  public getSelectedTotal(paymentType: 'total' | 'split'): number {
    if (paymentType === 'total') return this.getTotal();
    return this.cartValue.reduce((sum, item) => sum + (item.selected ? (this.getPriceWithTax(item.product, item.option) * (item.selectedQuantity || 0)) : 0), 0);
  }

  public toggleItemSelection(item: CartItem) {
    item.selected = !item.selected;
    item.selectedQuantity = item.selected ? item.quantity : 0;
    this._cart.next([...this.cartValue]);
  }

  public updateSelectedQuantity(item: CartItem, delta: number) {
    const newVal = (item.selectedQuantity || 0) + delta;
    if (newVal >= 0 && newVal <= item.quantity) {
      item.selectedQuantity = newVal;
      item.selected = newVal > 0;
      this._cart.next([...this.cartValue]);
    }
  }

  public syncOrder(tableUuid: string, openedByUserUuid: string | undefined): Observable<Order> {
    const orderData = {
      table_uuid: tableUuid,
      diners: this.currentOrderValue?.diners || parseInt(this.tempDinersValue) || 1,
      opened_by_user_uuid: this.currentOrderValue?.opened_by_user_uuid || openedByUserUuid,
      lines: this.cartValue.map(item => ({
        uuid: item.uuid,
        product_uuid: item.product.uuid,
        product_option: item.option,
        quantity: item.quantity,
        price: item.product.priceInCents + (item.option ? item.option.price_change : 0),
        tax_percentage: this.taxes.find(t => t.uuid === item.product.tax_id)?.percentage || 0
      }))
    };

    return this.orderService.sync(orderData).pipe(
      map((res: any) => {
        this.setCurrentOrder(res);
        // Update cart line UUIDs from sync response
        const updatedCart = this.cartValue.map(item => {
           const syncedLine = (res.lines || []).find((l: any) => l.product_uuid === item.product.uuid);
           return syncedLine ? { ...item, uuid: syncedLine.uuid } : item;
        });
        this.setCart(updatedCart);
        return res;
      })
    );
  }

  public loadOrderForTable(tableUuid: string, products: Product[]): Observable<Order | null> {
    return this.orderService.getActiveOrderByTable(tableUuid).pipe(
      map(order => {
        if (order) {
          this.setCurrentOrder(order);
          const cartItems = (order.lines || []).map(line => {
            const product = products.find(p => p.uuid === line.product_uuid);
            return {
              uuid: line.uuid,
              product: product!,
              quantity: line.quantity,
              option: line.product_option,
              selected: false,
              selectedQuantity: 0
            };
          });
          this.setCart(cartItems);
        } else {
          this.clearCart();
        }
        return order;
      })
    );
  }
}
