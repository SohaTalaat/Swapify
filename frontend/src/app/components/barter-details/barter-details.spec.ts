import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BarterDetails } from './barter-details';

describe('BarterDetails', () => {
  let component: BarterDetails;
  let fixture: ComponentFixture<BarterDetails>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BarterDetails]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BarterDetails);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
