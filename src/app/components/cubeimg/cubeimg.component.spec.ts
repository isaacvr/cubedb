import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CubeimgComponent } from './cubeimg.component';

describe('CubeimgComponent', () => {
  let component: CubeimgComponent;
  let fixture: ComponentFixture<CubeimgComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CubeimgComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CubeimgComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
