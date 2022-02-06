import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import * as randomWords from 'random-words';
import { HelpDialogComponent } from './help-dialog/help-dialog.component';
import { StatsDialogComponent } from './stats-dialog/stats-dialog.component';
import * as checkWord from 'check-if-word';
import { ErrorDialogComponent } from './error-dialog/error-dialog.component';
import { AppService } from './app.service';

enum Letter {
  Wrong,
  Misplaced,
  Correct
}

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  
  public myRow = 0;
  public myCol = 0;
  public myWord = '';

  private secret = '';
  private isChecking = false;

  public kbFirstRow = ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'];
  public kbSecondRow = ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'];
  public kbThirdRow = ['Z', 'X', 'C', 'V', 'B', 'N', 'M'];

  public words: string[] = [];
  public grid: string[][] = [
    ['', '', '', '', ''], 
    ['', '', '', '', ''], 
    ['', '', '', '', ''], 
    ['', '', '', '', ''], 
    ['', '', '', '', ''], 
    ['', '', '', '', '']
  ];

  constructor(private dialog: MatDialog,
              private appService: AppService) { }

  ngOnInit(): void { 
    this.words = this.appService.getWords().default;
    this.shuffleArray(this.words);
    this.secret = this.words[this.getRandomInt(this.words.length)];
  }

  typeLetter(letter: string) {
    if (this.myRow < 6 && this.myCol < 5) {
      this.grid[this.myRow][this.myCol] = letter;
      this.myCol += 1;
    }
  }

  eraseLetter() {
    if (this.myRow < 6 && this.myCol) {
      this.grid[this.myRow][this.myCol - 1] = '';
      this.myCol -= 1;
    }
  }

  enterWord() {
    const r = this.myRow;
    const guess = this.grid[r].join('').toLowerCase();

    if (guess.length < 5) {
      this.dialog.open(ErrorDialogComponent, {
        width: '100%',
        data: {
          message: 'Not enough letters!'
        }
      });
    } 
    else if (this.words.includes(guess)) {

      let c = 0;

      const r = this.myRow;
      const score = this.score(this.secret, guess);
      const colors = ['wrong', 'misplaced', 'correct'];

      const markGrid = setInterval(() => {

        const cell = document.getElementById(`cell-${r}${c}`) as HTMLInputElement;
        const letter = document.getElementById(`key${this.grid[r][c]}`) as HTMLButtonElement;
        const cname = colors[score[c]];
        const kcname = letter.className;

        cell!.className = cname;
        
        if (kcname === 'blank' || (kcname === 'misplaced' && cname === 'correct')) { 
          letter.className = cname;
        }

        c += 1;

        if (c == 5) { clearInterval(markGrid); }

      }, 400);

      this.myRow += 1;
      this.myCol = 0;
    } 
    else {
      this.dialog.open(ErrorDialogComponent, {
        width: '100%',
        data: {
          message: 'Not a valid word!'
        }
      });
    }
  }

  helpDialog() {
    this.dialog.open(HelpDialogComponent, {
      width: '100%'
    });
  }

  statsDialog() {
    this.dialog.open(StatsDialogComponent, {
      width: '100%'
    });
  }

  private zip(secret: string, guess: string): any {
    const tuples: any = [];

    for (let i = 0; i < 5; i += 1) {
      tuples.push([secret[i], guess[i]]);
    }

    return tuples;
  }

  private usable(secret: string, guess: string): any {
    const map: any = {};

    for (let i = 0; i < 5; i += 1) {
      if (guess[i] !== secret[i]) {
        map[secret[i]] = map[secret[i]] ? map[secret[i]] + 1 : 1;
      }
    }

    return map;
  }

  private score(secret: string, guess: string): any {
    const pool = this.usable(secret, guess);
    const result: any = [];

    for (let [secret_char, guess_char] of this.zip(secret, guess)) {
      if (secret_char === guess_char) {
        result.push(Letter.Correct);
      } else if (secret.includes(guess_char) && pool[guess_char] > 0) {
        result.push(Letter.Misplaced);
        pool[guess_char] -= 1;
      } else {
        result.push(Letter.Wrong);
      }
    }

    return result;
  }

  private shuffleArray(array: any) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      const temp = array[i];
      array[i] = array[j];
      array[j] = temp;
    }
  }

  private getRandomInt(max: number): number {
    return Math.floor(Math.random() * max);
  }
}
