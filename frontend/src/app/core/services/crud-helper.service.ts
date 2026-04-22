import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { UiService } from './ui.service';

@Injectable({
  providedIn: 'root',
})
export class CrudHelperService {
  constructor(private uiService: UiService) {}

  /**
   * Handles the creation of an item with standardized UI notifications
   */
  handleCreate<T>(
    createObservable: Observable<T>,
    successMessage: string,
    onSuccess?: (response: T) => void,
    onError?: (error: any) => void
  ): void {
    createObservable.subscribe({
      next: (response) => {
        this.uiService.showSuccess(successMessage);
        if (onSuccess) onSuccess(response);
      },
      error: (error) => {
        console.error('Error during creation:', error);
        this.uiService.showError('Error al crear el elemento');
        if (onError) onError(error);
      },
    });
  }

  /**
   * Handles the update of an item with standardized UI notifications
   */
  handleUpdate<T>(
    updateObservable: Observable<T>,
    successMessage: string,
    onSuccess?: (response: T) => void,
    onError?: (error: any) => void
  ): void {
    updateObservable.subscribe({
      next: (response) => {
        this.uiService.showSuccess(successMessage);
        if (onSuccess) onSuccess(response);
      },
      error: (error) => {
        console.error('Error during update:', error);
        this.uiService.showError('Error al actualizar el elemento');
        if (onError) onError(error);
      },
    });
  }

  /**
   * Handles the deletion of an item with standardized UI notifications
   */
  handleDelete<T>(
    deleteObservable: Observable<T>,
    successMessage: string,
    onSuccess?: (response: T) => void,
    onError?: (error: any) => void
  ): void {
    deleteObservable.subscribe({
      next: (response) => {
        this.uiService.showSuccess(successMessage);
        if (onSuccess) onSuccess(response);
      },
      error: (error) => {
        console.error('Error during deletion:', error);
        this.uiService.showError('Error al eliminar el elemento');
        if (onError) onError(error);
      },
    });
  }
}
