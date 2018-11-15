import {Injectable} from '@angular/core';
import {HttpClient, HttpHeaders} from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class RemoteService {
  host: String = 'localhost';
  apiUrl: String = 'http://' + this.host + ':7890/1.1/statuses/user_timeline.json';

  constructor(private http: HttpClient) {
  }
  getTweets(user, count) {
    // console.log('d');
    return this.http.get(this.apiUrl + '?count=' + count + '&screen_name=' + user );
  }
}
