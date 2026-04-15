import { Component, OnInit } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-employee-layout',
  templateUrl: './employee-layout.component.html',
  styleUrls: ['./employee-layout.component.scss'],
  standalone: true,
  imports: [IonicModule, RouterModule]
})
export class EmployeeLayoutComponent  implements OnInit {

  constructor() { }

  ngOnInit() {}

}

