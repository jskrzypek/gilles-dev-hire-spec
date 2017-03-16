import { Injectable }              from '@angular/core';
import { Http, Response }          from '@angular/http';

import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/catch';
import 'rxjs/add/operator/map';
import { secret } from '../../../secrets.js';

import crypto from 'crypto';

import { Hero } from './list';

@Injectable()
export class HeroService {
  private heroesUrl = 'http://gateway.marvel.com/v1/public/characters'; // URL to web API
  constructor (private http: Http) {}

  getHeroes(): Observable<Hero[]> {
    function getRandomIntInclusive(min, max) {
      min = Math.ceil(min);
      max = Math.floor(max);
      return Math.floor(Math.random() * (max - min + 1)) + min;
    }
    let random = getRandomIntInclusive(10, 100);
    let publicKey = '216f5b23efe228e0eb005c1d68bc0ad7',
        privateKey = secret,
        ts = new Date().getTime();
    let hash = crypto.createHash('md5').update(ts + privateKey + publicKey).digest('hex');
    let endUrl = "?limit=20&offset=" + random + "&apikey=" + publicKey + "&ts=" + ts + "&hash=" + hash;
    let finalUrl = this.heroesUrl + endUrl;

    return this.http
      .get(finalUrl)
      .map(this.extractData)
      .catch(this.handleError);
  }

  // private addThumbnail(array) {
  //   array.forEach((item) => {
  //     item.smallIcon = item.thumbnail.path + 'portrait_small.jpg'
  //   })
  // }

  private extractData(res: Response) {
    let body = res.json();
    // Icon paths need extra text to properly output icon images
    body.data.results.map((item) => {
      item['iconLG'] = item.thumbnail.path + '.jpg'
      item['icon'] = item.thumbnail.path + '/portrait_small.jpg'
    })

    return body.data.results || { };
  }

  private handleError (error: Response | any) {
    // In a real world app, you might use a remote logging infrastructure
    let errMsg: string;
    if (error instanceof Response) {
      const body = error.json() || '';
      const err = body.error || JSON.stringify(body);
      errMsg = `${error.status} - ${error.statusText || ''} ${err}`;
    } else {
      errMsg = error.message ? error.message : error.toString();
    }
    console.error(errMsg);
    return Observable.throw(errMsg);
  }
}
