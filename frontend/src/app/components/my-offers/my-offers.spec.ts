import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MyOffers } from './my-offers';

describe('MyOffers', () => {
  let component: MyOffers;
  let fixture: ComponentFixture<MyOffers>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MyOffers]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MyOffers);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
