import { Component, OnInit } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-tpv-layout',
  templateUrl: './tpv-layout.component.html',
  styleUrls: ['./tpv-layout.component.scss'],
  standalone: true,
  imports: [IonicModule, RouterModule]
})
export class TPVLayoutComponent  implements OnInit {

  constructor() { }

  ngOnInit() {}

}

