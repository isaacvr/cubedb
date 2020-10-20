import { TestBed } from '@angular/core/testing';

import { ScramblerService } from './scrambler.service';

describe('ScramblerService', () => {
  let service: ScramblerService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ScramblerService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
