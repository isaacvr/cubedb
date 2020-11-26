import { ImportExportComponent } from './components/import-export/import-export.component';
import { SettingsComponent } from './components/settings/settings.component';
import { TimerComponent } from './components/timer/timer.component';
import { TutorialParserComponent } from './components/tutorial-parser/tutorial-parser.component';
import { TutorialsComponent } from './components/tutorials/tutorials.component';
import { AlgorithmsComponent } from './components/algorithms/algorithms.component';
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { HomeComponent } from './components/home/home.component';
import { PllTrainerComponent } from './components/pll-trainer/pll-trainer.component';
import { IterativePuzzleComponent } from './components/iterative-puzzle/iterative-puzzle.component';

export function matcher(url) {
  if ( url.length >= 1 && url[0].path.match(/^algorithms$/) ) {
    return {
      consumed: url,
    }
  }

  return null;
}

const routes: Routes = [
  {
    path: '',
    component: HomeComponent
  },
  {
    matcher,
    component: AlgorithmsComponent
  },
  {
    path: 'tutorials',
    component: TutorialsComponent
  },
  {
    path: 'tutorials/:something',
    redirectTo: 'tutorials'
  },
  {
    path: 'tutorials/:puzzle/:tutorial',
    component: TutorialParserComponent
  },
  {
    path: 'timer',
    component: TimerComponent
  },
  {
    path: 'pll-trainer',
    component: PllTrainerComponent
  },
  {
    path: 'settings',
    component: SettingsComponent
  },
  {
    path: 'import_export',
    component: ImportExportComponent
  },
  {
    path: 'simulator',
    component: IterativePuzzleComponent
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
