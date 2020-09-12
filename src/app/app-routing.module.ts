import { TutorialParserComponent } from './components/tutorial-parser/tutorial-parser.component';
import { TutorialsComponent } from './components/tutorials/tutorials.component';
import { AlgorithmsComponent } from './components/algorithms/algorithms.component';
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { HomeComponent } from './components/home/home.component';

const routes: Routes = [
  {
    path: '',
    component: HomeComponent
  },
  // {
  //   path: 'algorithms',
  //   component: AlgorithmsComponent
  // },
  {
    matcher: (url) => {
      // console.log('URL: ', url);
      if ( url.length >= 1 && url[0].path.match(/^algorithms$/) ) {
        // console.log('AUDAISHDAIUSDHSU');
        return {
          consumed: url,
        }
      }

      return null;
    },
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
  }
  // {
  //   path: 'algorithms/:puzzle/:group',
  //   component: AlgorithmsComponent
  // },
  // {
  //   path: 'algorithms/:puzzle/:group/:algorithm',
  //   component: AlgorithmsComponent
  // },
  // {
  //   path: 'algorithms/:puzzle/:group/:subgroup/:algorithm',
  //   component: AlgorithmsComponent
  // },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
