import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MyBarters } from './my-barters';

describe('MyBarters', () => {
  let component: MyBarters;
  let fixture: ComponentFixture<MyBarters>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MyBarters]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MyBarters);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
