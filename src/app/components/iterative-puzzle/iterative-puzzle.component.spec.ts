import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { IterativePuzzleComponent } from './iterative-puzzle.component';

describe('IterativePuzzleComponent', () => {
  let component: IterativePuzzleComponent;
  let fixture: ComponentFixture<IterativePuzzleComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ IterativePuzzleComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(IterativePuzzleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
