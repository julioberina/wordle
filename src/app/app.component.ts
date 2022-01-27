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
    console.log(JSON.stringify(this.grid));
  }
}
