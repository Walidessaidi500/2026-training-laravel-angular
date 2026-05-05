import { Injectable, inject } from '@angular/core';
import { BehaviorSubject, Observable, map } from 'rxjs';
import { Product } from '@services/domain/product.service';
import { Tax } from '@services/domain/tax.service';
import { Order, OrderService } from '@services/domain/order.service';
import { UiService } from '@app/core/services/ui/ui.service';

export interface CartItem {
  uuid?: string;
  product: Product;
  quantity: number;
  selected?: boolean;
  selectedQuantity?: number;
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

  public addToCart(product: Product) {
    const currentCart = this.cartValue;
    const existingItem = currentCart.find(item => item.product.uuid === product.uuid);
    const currentQtyInCart = existingItem ? existingItem.quantity : 0;

    if (currentQtyInCart >= product.stock) {
      this.uiService.showError(`No queda más stock de ${product.name}`);
      return;
    }

    if (existingItem) {
      existingItem.quantity++;
      this._cart.next([...currentCart]);
    } else {
      this._cart.next([...currentCart, { product, quantity: 1, selected: false, selectedQuantity: 0 }]);
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

  public getPriceWithTax(product: Product): number {
    const tax = this.taxes.find(t => t.uuid === product.tax_id);
    const percentage = tax ? tax.percentage : 0;
    return product.priceInCents * (1 + percentage / 100);
  }

  public getTotal(): number {
    return this.cartValue.reduce((sum, item) => sum + (this.getPriceWithTax(item.product) * item.quantity), 0);
  }

  public getSelectedTotal(paymentType: 'total' | 'split'): number {
    if (paymentType === 'total') return this.getTotal();
    return this.cartValue.reduce((sum, item) => sum + (item.selected ? (this.getPriceWithTax(item.product) * (item.selectedQuantity || 0)) : 0), 0);
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
        quantity: item.quantity,
        price: item.product.priceInCents,
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
