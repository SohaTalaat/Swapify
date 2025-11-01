import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditOffer } from './edit-offer';

describe('EditOffer', () => {
  let component: EditOffer;
  let fixture: ComponentFixture<EditOffer>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EditOffer]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EditOffer);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
