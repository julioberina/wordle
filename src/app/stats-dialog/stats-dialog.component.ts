import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-stats-dialog',
  templateUrl: './stats-dialog.component.html',
  styleUrls: ['./stats-dialog.component.scss']
})
export class StatsDialogComponent implements OnInit {

  public wstats: any;
  public gamesPlayed = 0;
  public gamesWon = 0;
  public isGameOver = false;
  public secret = '';

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any
  ) { }

  ngOnInit(): void {
    this.wstats = this.data.wstats;
    this.gamesPlayed = this.wstats.gamesPlayed || 0;
    this.gamesWon = this.wstats.gamesWon || 0;
    this.isGameOver = this.wstats.isGameOver || false;
    this.secret = this.wstats.secret || '';
  }

}
