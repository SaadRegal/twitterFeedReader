import {Injectable} from '@angular/core';
import {HttpClient, HttpParams} from '@angular/common/http';
import {Observable} from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class RemoteService {
  host: String = 'localhost';
  readonly apiUrl: any = 'http://' + this.host + ':7890/1.1/statuses/user_timeline.json';

  constructor(private http: HttpClient) {
  }

  getTweets(user, count) {
    // console.log('d');

    const params = new HttpParams()
      .set('count', count)
      .set('screen_name', user);
    return this.http.get(this.apiUrl, {params});
  }
}
