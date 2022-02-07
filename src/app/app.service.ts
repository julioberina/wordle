import { Injectable } from '@angular/core';
import * as wordsJson from '../assets/words.json';
import * as answersJson from '../assets/answers.json';

@Injectable({
  providedIn: 'root'
})
export class AppService {

  constructor() { }

  getWords(): any {
    return wordsJson;
  }

  getAnswers(): any {
    return answersJson;
  }
}
