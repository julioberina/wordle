import { Component, OnDestroy, OnInit } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import * as randomWords from 'random-words';
import { HelpDialogComponent } from './help-dialog/help-dialog.component';
import { StatsDialogComponent } from './stats-dialog/stats-dialog.component';
import * as checkWord from 'check-if-word';
import { ErrorDialogComponent } from './error-dialog/error-dialog.component';
import { AppService } from './app.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { CookieService } from 'ngx-cookie-service';

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

  private secret = '';
  private wstats: any;
  private guesses: string[] = [];

  public kbFirstRow = ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'];
  public kbSecondRow = ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'];
  public kbThirdRow = ['Z', 'X', 'C', 'V', 'B', 'N', 'M'];

  public answers: string[] = [];
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
              private snackBar: MatSnackBar,
              private appService: AppService,
              private cookieService: CookieService) { }

  ngOnInit(): void { 
    this.getwStats();
    this.words = this.appService.getWords().default;
    this.answers = this.appService.getAnswers().default;
    this.shuffleArray(this.answers);
  }

  ngAfterViewInit(): void {
    this.resumeGame();
    if (!this.wstats.secret)  this.startGame();
  }

  savewStats(): void {
    this.wstats.myRow = this.myRow;
    this.wstats.myCol = 0;
    this.wstats.secret = this.secret;
    this.wstats.grid = this.grid;
    this.wstats.guesses = this.guesses;
    localStorage.setItem('wstats', JSON.stringify(this.wstats));
    //this.cookieService.set('wstats', JSON.stringify(this.wstats));
  }

  typeLetter(letter: string) {
    if (!this.wstats.isGameOver && this.myCol < 5) {
      this.grid[this.myRow][this.myCol] = letter;
      this.myCol += 1;
    }
  }

  eraseLetter() {
    if (!this.wstats.isGameOver && this.myCol) {
      this.grid[this.myRow][this.myCol - 1] = '';
      this.myCol -= 1;
    }
  }

  enterWord() {
    if (this.wstats.isGameOver) { return; }

    const r = this.myRow;
    const guess = this.grid[r].join('').toLowerCase();

    if (guess.length < 5) {
      this.snackBar.open('Not enough letters!', void 0, {
        duration: 2000,
        horizontalPosition: 'center',
        verticalPosition: 'top',
        panelClass: ['snack']
      });
    } 
    else if (this.words.includes(guess)) {

      let c = 0;

      const r = this.myRow;
      const score = this.score(this.secret, guess);
      const colors = ['wrong', 'misplaced', 'correct'];

      this.guesses.push(guess);

      const markGrid = setInterval(() => {

        const cell = document.getElementById(`cell-${r}${c}`) as HTMLInputElement;
        const letter = document.getElementById(`key${this.grid[r][c]}`) as HTMLButtonElement;
        const cname = colors[score[c]];
        const kcname = letter.className;

        cell!.className = cname;
        
        if (kcname === 'blank' || (colors.indexOf(kcname) < score[c])) { 
          letter.className = cname;
        }

        c += 1;

        if (c === 5) { clearInterval(markGrid); }

      }, 400);

      if (score.reduce((a: number, b: number) => a + b) === 10) {
        this.wstats.isGameOver = true;
        this.wstats.gamesPlayed += 1;
        this.wstats.gamesWon += 1;
        this.savewStats();
        setTimeout(() => { this.statsDialog(); }, 2400);
      } else { 
        this.myRow += 1;
        this.myCol = 0;
        this.wstats.isGameOver = (this.myRow === 6);
        this.wstats.gamesPlayed += ((this.myRow === 6 && 1) || 0);
        this.savewStats();
        if (this.wstats.isGameOver) { setTimeout(() => { this.statsDialog(); }, 2400); }
      }
    } 
    else {
      this.snackBar.open('Not a valid word!', void 0, {
        duration: 2000,
        horizontalPosition: 'center',
        verticalPosition: 'top',
        panelClass: ['snack']
      });
    }
  }

  helpDialog() {
    this.dialog.open(HelpDialogComponent, {
      width: '100%'
    });
  }

  statsDialog() {
    const dialogRef = this.dialog.open(StatsDialogComponent, {
      width: '100%',
      data: {
        wstats: this.wstats
      }
    });

    dialogRef.afterClosed().subscribe(res => {
      if (res) {
        this.startGame();
      }
    })
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

  private getwStats() {
    this.wstats = JSON.parse(localStorage.getItem('wstats') || '{}');
    //this.wstats = JSON.parse(this.cookieService.get('wstats') || '{}');
    this.wstats.gamesPlayed = this.wstats.gamesPlayed || 0;
    this.wstats.gamesWon = this.wstats.gamesWon || 0;
    this.wstats.isGameOver = this.wstats.isGameOver || false;

    this.myRow = this.wstats.myRow || this.myRow;
    this.myCol = this.wstats.myCol || this.myCol;
    this.guesses = this.wstats.guesses || this.guesses;
    this.grid = this.wstats.grid || this.grid;
    this.secret = this.wstats.secret || this.secret;
  }

  private startGame() {
    this.secret = this.answers[this.getRandomInt(this.answers.length)];
    this.wstats.secret = this.secret;
    this.myRow = 0;
    this.myCol = 0;
    this.guesses = [];
    this.grid = [
      ['', '', '', '', ''], 
      ['', '', '', '', ''], 
      ['', '', '', '', ''], 
      ['', '', '', '', ''], 
      ['', '', '', '', ''], 
      ['', '', '', '', '']
    ];

    this.wstats.isGameOver = false;
    this.savewStats();
    this.resetGrid();
    this.resetKeyboard();
  }

  private resumeGame() {
    if (this.secret && this.guesses.length > 0) {
      const colors = ['wrong', 'misplaced', 'correct'];

      for (let r = 0; r < this.guesses.length; ++r) {
        const guess = this.guesses[r];
        const score = this.score(this.secret, guess);

        for (let c = 0; c < 5; ++c) {
          const cell = document.getElementById(`cell-${r}${c}`) as HTMLInputElement;
          const letter = document.getElementById(`key${this.grid[r][c]}`) as HTMLButtonElement;
          const cname = colors[score[c]];
          const kcname = letter.className;
    
          cell!.className = cname;
          
          if (kcname === 'blank' || (kcname === 'misplaced' && cname === 'correct')) { 
            letter.className = cname;
          }
        }
      }
    }
  }

  private resetGrid() {
    for (let r = 0; r < 6; ++r) {
      for (let c = 0; c < 5; ++c) {
        const cell = document.getElementById(`cell-${r}${c}`) as HTMLInputElement;
        cell!.className = 'blank';
      }
    }
  }

  private resetKeyboard() {
    for (let k of this.kbFirstRow.concat(this.kbSecondRow).concat(this.kbThirdRow)) {
      const letter = document.getElementById(`key${k}`) as HTMLButtonElement;
      letter!.className = 'blank';
    }
  }
}
