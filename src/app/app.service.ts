import { Injectable } from '@angular/core';
import * as wordsJson from '../assets/words.json';

@Injectable({
  providedIn: 'root'
})
export class AppService {

  constructor() { }

  getWords(): any {
    return wordsJson;
  } 
}
