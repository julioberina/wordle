import { Component, OnInit } from '@angular/core';
import * as randomWords from 'random-words';

enum Letter {
  Blank,
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

  constructor() {}

  ngOnInit(): void {
    this.words = randomWords({ exactly: 5, maxLength: 5 });
  }

  typeLetter(letter: string) {
    if (this.myCol < 5) {
      this.grid[this.myRow][this.myCol] = letter;
      this.myCol += 1;
    }
  }

  eraseLetter() {
    if (this.myCol) {
      this.grid[this.myRow][this.myCol - 1] = '';
      this.myCol -= 1;
    }
  }

  enterWord() {
    this.myRow += 1;
    this.myCol = 0;
  }
}
