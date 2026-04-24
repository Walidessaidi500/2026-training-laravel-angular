import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { UiService } from '../ui/ui.service';

@Injectable({
  providedIn: 'root',
})
export class CrudHelperService {
  constructor(private uiService: UiService) {}

  /**
   * Handles de creacion con notificaciones estandarizadas de UI
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
   * Handles de actualizacion con notificaciones estandarizadas de UI
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
   * Handles de eliminacion con notificaciones estandarizadas de UI
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
