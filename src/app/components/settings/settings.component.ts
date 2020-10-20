import { FONTS } from './../../fonts/index';
import { generateRandomImage, ThemeService } from './../../services/theme.service';
import { Component, OnInit } from '@angular/core';
import { THEMES, THEME_NAMES } from 'app/themes';

interface ThemePreview {
  img: string;
  name: string;
  code: string;
}

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss']
})
export class SettingsComponent implements OnInit {
  themeNames: string[][];
  fontNames: string[][];
  from: string;
  to: string;
  themesPrev: ThemePreview[];
  regularFont: string;
  timerFont: string;

  constructor(private themeService: ThemeService) {
    this.themeNames = [];
    this.fontNames = [];

    for (let [key, value] of THEME_NAMES) {
      this.themeNames.push([ key, value ]);
    }

    for (let [key, value] of FONTS) {
      this.fontNames.push([ key, value ]);
    }

    this.themesPrev = [];

    for (let [key, value] of THEMES) {
      this.themesPrev.push({
        code: key,
        name: THEME_NAMES.get(key),
        img: generateRandomImage(value[0][0], value[1][0], 300, 300, 0.003)
      });
    }

    this.regularFont = this.themeService.getRegularFont();
    this.timerFont = this.themeService.getTimerFont();

  }

  selectRegularFont() {
    this.themeService.setRegularFont( this.regularFont );
  }

  selectTimerFont() {
    this.themeService.setTimerFont( this.timerFont );
  }

  selectTheme(theme) {
    this.themeService.setTheme(theme);
  }

  setBackground() {
    this.themeService.setBackground(this.from, this.to);
  }

  ngOnInit(): void {
  }

}
