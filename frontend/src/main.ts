import { bootstrapApplication } from '@angular/platform-browser';
import { provideHttpClient, withInterceptorsFromDi, withFetch, HTTP_INTERCEPTORS } from '@angular/common/http';
import { RouteReuseStrategy, provideRouter, withPreloading, PreloadAllModules } from '@angular/router';
import { IonicRouteStrategy, provideIonicAngular } from '@ionic/angular/standalone';

import { routes } from './app/app.routes';
import { AppComponent } from './app/app.component';
import { InterceptorProvider } from './app/providers/interceptor';

// Cargar Ionicons
import { addIcons } from 'ionicons';
import {
  gridOutline,
  cubeOutline,
  folderOutline,
  calculatorOutline,
  mapOutline,
  restaurantOutline,
  flameOutline,
  flameSharp,
  arrowUpOutline,
  arrowDownOutline,
  arrowForwardOutline,
  checkmarkCircleOutline,
  timeOutline,
  closeCircleOutline,
  flashOutline,
  cartOutline,
  pieChartOutline,
  peopleOutline,
  chevronForwardOutline,
  flame,
  alertCircleOutline,
  warningOutline,
  personOutline,
} from 'ionicons/icons';

// Registrar iconos
addIcons({
  'grid-outline': gridOutline,
  'cube-outline': cubeOutline,
  'folder-outline': folderOutline,
  'calculator-outline': calculatorOutline,
  'map-outline': mapOutline,
  'restaurant-outline': restaurantOutline,
  'flame-outline': flameOutline,
  'flame-sharp': flameSharp,
  'arrow-up-outline': arrowUpOutline,
  'arrow-down-outline': arrowDownOutline,
  'arrow-forward-outline': arrowForwardOutline,
  'checkmark-circle-outline': checkmarkCircleOutline,
  'time-outline': timeOutline,
  'close-circle-outline': closeCircleOutline,
  'flash-outline': flashOutline,
  'cart-outline': cartOutline,
  'pie-chart-outline': pieChartOutline,
  'people-outline': peopleOutline,
  'chevron-forward-outline': chevronForwardOutline,
  'flame': flame,
  'arrow-up': arrowUpOutline,
  'arrow-down': arrowDownOutline,
  'arrow-forward': arrowForwardOutline,
  'checkmark-circle': checkmarkCircleOutline,
  'time': timeOutline,
  'close-circle': closeCircleOutline,
  'flash': flashOutline,
  'cart': cartOutline,
  'pie-chart': pieChartOutline,
  'people': peopleOutline,
  'chevron-forward': chevronForwardOutline,
  'cash': arrowUpOutline,
  'calculator': calculatorOutline,
  'cube': cubeOutline,
  'alert-circle': alertCircleOutline,
  'warning': warningOutline,
  'person': personOutline,
});

bootstrapApplication(AppComponent, {
  providers: [
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
    { provide: HTTP_INTERCEPTORS, useClass: InterceptorProvider, multi: true },
    provideIonicAngular({ mode: 'ios' }),
    provideHttpClient(withInterceptorsFromDi(), withFetch()),
    provideRouter(routes, withPreloading(PreloadAllModules)),
  ],
});
