import { Injectable } from '@angular/core';
import { AlertController, ToastController } from '@ionic/angular/standalone';

@Injectable({
  providedIn: 'root',
})
export class UiService {
  constructor(
    private toastController: ToastController,
    private alertController: AlertController
  ) {}

  /**
   * toast de éxito
   */
  async showSuccess(message: string): Promise<void> {
    const toast = await this.toastController.create({
      message,
      duration: 2500,
      position: 'top',
      color: 'success',
      icon: 'checkmark-circle',
    });
    await toast.present();
  }

  /**
   *toast de error
   */
  async showError(message: string): Promise<void> {
    const toast = await this.toastController.create({
      message,
      duration: 2500,
      position: 'top',
      color: 'danger',
      icon: 'alert-circle',
    });
    await toast.present();
  }

  /**
   *toast de advertencia
   */
  async showWarning(message: string): Promise<void> {
    const toast = await this.toastController.create({
      message,
      duration: 2500,
      position: 'top',
      color: 'warning',
      icon: 'warning-outline',
    });
    await toast.present();
  }

  /**
   * Confirmar delete
   */
  async confirmDelete(
    header: string,
    message: string,
    onConfirm: () => void
  ): Promise<void> {
    const alert = await this.alertController.create({
      header,
      message,
      backdropDismiss: false,
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
        },
        {
          text: 'Eliminar',
          role: 'destructive',
          handler: () => {
            onConfirm();
          },
        },
      ],
    });

    await alert.present();
  }

  /**
   *Confirmar accion generica
   */
  async confirm(
    header: string,
    message: string,
    confirmText: string = 'Confirmar',
    onConfirm: () => void
  ): Promise<void> {
    const alert = await this.alertController.create({
      header,
      message,
      backdropDismiss: false,
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
        },
        {
          text: confirmText,
          handler: () => {
            onConfirm();
          },
        },
      ],
    });

    await alert.present();
  }
}
