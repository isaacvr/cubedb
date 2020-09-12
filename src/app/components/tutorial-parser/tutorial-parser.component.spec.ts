import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TutorialParserComponent } from './tutorial-parser.component';

describe('TutorialParserComponent', () => {
  let component: TutorialParserComponent;
  let fixture: ComponentFixture<TutorialParserComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TutorialParserComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TutorialParserComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
