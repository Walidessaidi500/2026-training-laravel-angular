import { Injectable } from '@angular/core';

export interface PrintItem {
  quantity: number;
  concept: string;
  price: number;
  total: number;
}

export interface PrintData {
  restaurantName: string;
  ticketNumber: string;
  date: string;
  hour: string;
  items: PrintItem[];
  ivaPercentage: number;
  baseImponible: number;
  ivaAmount: number;
  total: number;
}

@Injectable({
  providedIn: 'root'
})
export class PrintService {

  constructor() {}

  public printTicket(data: PrintData): void {
    const ticketText = this.generateTicketText(data);
    const printWindow = window.open('', '_blank');

    if (!printWindow) {
      alert('Por favor, permite las ventanas emergentes para imprimir el ticket.');
      return;
    }

    printWindow.document.write(`
      <html>
        <head>
          <title>Ticket ${data.ticketNumber}</title>
          <style>
            @page { margin: 0; }
            body { 
              margin: 0; 
              padding: 5mm; 
              width: 80mm; 
              font-family: 'Courier New', Courier, monospace; 
              font-size: 12px;
            }
            pre { 
              white-space: pre-wrap; 
              word-wrap: break-word; 
              line-height: 1.2;
              margin: 0;
            }
          </style>
        </head>
        <body>
          <pre>${ticketText}</pre>
          <script>
            window.onload = function() {
              window.print();
              window.onafterprint = function() {
                window.close();
              };
              // Fallback for some browsers
              setTimeout(() => {
                if (!window.closed) window.close();
              }, 1000);
            };
          <\/script>
        </body>
      </html>
    `);

    printWindow.document.close();
  }

  private generateTicketText(data: PrintData): string {
    const width = 42;
    const pad = (str: any, len: number) => str.toString().padEnd(len, ' ');
    const padLeft = (str: any, len: number) => str.toString().padStart(len, ' ');

    let t = "";
    const center = (txt: string) => {
      const spaces = Math.max(0, Math.floor((width - txt.length) / 2));
      return " ".repeat(spaces) + txt + "\n";
    };

    t += center(data.restaurantName);
    t += center("------------------------------------------");
    t += `FECHA: ${data.date}   HORA: ${data.hour}\n`;
    t += `TICKET: ${data.ticketNumber}\n`;
    t += "------------------------------------------\n";
    t += `CANT | CONCEPTO           | PRECIO | IMPORTE\n`;
    t += "------------------------------------------\n";

    data.items.forEach(item => {
      const cant = pad(item.quantity, 4);
      const concept = pad(item.concept.substring(0, 18), 18);
      const price = padLeft(item.price.toFixed(2), 8);
      const total = padLeft(item.total.toFixed(2), 8);
      t += `${cant} ${concept} ${price} ${total}\n`;
    });

    t += "------------------------------------------\n";
    t += pad("BASE IMPONIBLE:", 32) + padLeft(data.baseImponible.toFixed(2), 10) + "\n";
    t += pad(`IVA (${data.ivaPercentage}%):`, 32) + padLeft(data.ivaAmount.toFixed(2), 10) + "\n";
    t += "------------------------------------------\n";
    t += pad("TOTAL:", 25) + padLeft(data.total.toFixed(2) + "€", 17) + "\n";
    t += "------------------------------------------\n";
    t += center("GRACIAS POR SU VISITA");

    return t;
  }
}
