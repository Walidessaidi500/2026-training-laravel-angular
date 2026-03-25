import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { TaxListComponent } from './tax-list.component';

describe('TaxListComponent', () => {
  let component: TaxListComponent;
  let fixture: ComponentFixture<TaxListComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [TaxListComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(TaxListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
