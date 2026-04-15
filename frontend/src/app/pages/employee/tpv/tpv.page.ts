import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { TableService, Table } from '@services/domain/table.service';
import { Observable, map } from 'rxjs';

@Component({
  selector: 'app-tpv',
  templateUrl: './tpv.page.html',
  styleUrls: ['./tpv.page.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule]
})
export class TpvPage implements OnInit {
  private readonly tableService = inject(TableService);

  public tables$: Observable<Table[]> = this.tableService.list(1, 1000).pipe(
    map(res => res.data)
  );

  constructor() {}

  ngOnInit() {}

  public onTableClick(table: Table): void {
    console.log('Mesa seleccionada:', table.name);
  }
}