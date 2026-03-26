import { Component, Input, OnInit } from '@angular/core';
import { IonButton } from '@ionic/angular/standalone';

@Component({
  selector: 'app-button',
  templateUrl: './button.component.html',
  styleUrls: ['./button.component.scss'],
  standalone: true,
  imports: [IonButton],
})
export class ButtonComponent implements OnInit {
  @Input() color: 'primary' | 'secondary' | 'tertiary' | 'light' | 'dark' = 'primary';
  @Input() fill: 'clear' | 'outline' | 'solid' = 'solid';
  @Input() expand: 'block' | 'full' | undefined;

  constructor() { }

  ngOnInit() {}
}
