import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PllTrainerComponent } from './pll-trainer.component';

describe('PllTrainerComponent', () => {
  let component: PllTrainerComponent;
  let fixture: ComponentFixture<PllTrainerComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PllTrainerComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PllTrainerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
