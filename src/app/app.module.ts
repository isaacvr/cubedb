/// Angular modules
import { BrowserModule, DomSanitizer } from '@angular/platform-browser';
import { NgModule, ErrorHandler } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatIconRegistry } from '@angular/material/icon';
import { HttpClientModule } from '@angular/common/http';

/// Vendor modules
import { ChartsModule } from 'ng2-charts';

/// My modules & components
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HomeComponent } from './components/home/home.component';
import { AlgorithmsComponent } from './components/algorithms/algorithms.component';
import { NavbarComponent } from './components/navbar/navbar.component';
import { CubeimgComponent } from './components/cubeimg/cubeimg.component';
import { PuzzleComponent } from './components/puzzle/puzzle.component';
import { TutorialsComponent } from './components/tutorials/tutorials.component';
import { TutorialParserComponent } from './components/tutorial-parser/tutorial-parser.component';
import { FrameComponent } from './components/frame/frame.component';
import { TimerComponent } from './components/timer/timer.component';
import { TimerPipe } from './pipes/timer.pipe';
import { GlobalErrorHandler } from './classes/error-handler';
import { MatComponentsModule } from './modules/mat-components/mat-components.module';
import { PllTrainerComponent } from './components/pll-trainer/pll-trainer.component';
import { SettingsComponent } from './components/settings/settings.component';
import { DialogComponent } from './components/dialog/dialog.component';

@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    AlgorithmsComponent,
    NavbarComponent,
    CubeimgComponent,
    PuzzleComponent,
    TutorialsComponent,
    TutorialParserComponent,
    FrameComponent,
    TimerComponent,
    TimerPipe,
    PllTrainerComponent,
    SettingsComponent,
    DialogComponent,
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    AppRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    MatComponentsModule,
    ChartsModule,
  ],
  bootstrap: [AppComponent],
  providers: [
    {provide: ErrorHandler, useClass: GlobalErrorHandler}
  ],
  entryComponents: [
    DialogComponent
  ]
})
export class AppModule {
  constructor(private matIconRegistry: MatIconRegistry, domSanitizer: DomSanitizer) {
    this.matIconRegistry.addSvgIconSet(domSanitizer.bypassSecurityTrustResourceUrl('../assets/mdi.svg'));
  }
}
