import {Component, OnInit} from '@angular/core';
import {DragulaService} from 'ng2-dragula';
import {RemoteService} from '../../Services/remote/remote.service';

declare let $: any;

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {

  constructor(private dragulaService: DragulaService, private remote: RemoteService) {
    dragulaService.createGroup('FEED', {
      direction: 'horizontal',
      moves: (el, container, handle) => {
        return handle.classList.contains('move');
      },
    }).drake.on('drop', () => {
      this.saveSettings();
    });
    const localSettings = (localStorage.getItem('settings'));
    if (localSettings) {
      this.settings = JSON.parse(localSettings);
    } else {
      // Default Settings
      const today = new Date(Date.now());
      this.settings = {
        theme: {
          color: 'blue',
          isInverted: false
        },
        layout: {
          count: 3,
          order: ['MakeSchool', 'newsycombinator', 'ycombinator'],
          timeRange: {
            max: new Date(Date.now()),
            min: new Date(today.getFullYear(), today.getMonth(), today.getDate() - 5)
          }
        }
      };
    }
    this.tweets = [];
    this.filteredTweets = [];
  }

  settings: Settings;
  acceptedColors = 'blue purple pink teal green grey orange black violet green red olive';
  tweets: any;
  filteredTweets: any;


  ngOnInit() {
    this.loadTweets();
  }

  loadTweets() {
    this.tweets = [];
    $('.noResult').remove();
    $('.placeholderSegment').css('display', 'block');

    console.log('loading tweets');
    this.getTweets();
  }

  displayColumns() {

    this.loadSettings();
    this.initUI();
    $('.placeholderSegment').css('display', 'none');
    $('.feedColumn').css('display', 'block');

  }

  async getTweets() {
    const users = this.settings.layout.order;
    for (let i = 0; i < users.length; i++) {
      console.log(i);
      await new Promise(resolve => {
        this.remote.getTweets(users[i], this.settings.layout.count).subscribe((data: any) => {
          let newArr = data;
          newArr = newArr.filter((item: any) => {
            return new Date(item.created_at) >= new Date(this.settings.layout.timeRange.min) &&
              new Date(item.created_at) <= new Date(this.settings.layout.timeRange.max);
          });
          console.log(newArr);
          this.tweets.push(newArr);
          if (data) {
            resolve();
          }
          if (i === users.length - 1) {
            setTimeout(() => {
              this.displayColumns();
            }, 500);
          }
        });

      });

    }
  }

  loadSettings() {
    this.changeTheme(this.settings.theme.color);
  }

  saveSettings() {
    localStorage.setItem('settings', JSON.stringify(this.settings));
  }

  showThemeBar() {
    $('.ui.sidebar').sidebar({
      silent: true, onHide: function () {
        $('.timeRange').calendar();
      }
    }).sidebar('show');
  }

  changeTheme(color) {
    this.settings.theme.color = color;
    const theme = '.theme';
    $(theme).removeClass(this.acceptedColors);
    $(theme).addClass(color);
    this.invertedTheme(this.settings.theme.isInverted);
  }

  invertedTheme(active) {
    this.settings.theme.isInverted = active;
    const feed = '.ui.feed';
    if (active) {
      // Setting inverted style
      $('.segment.theme').addClass('inverted raised');
      $('h4').removeClass(this.acceptedColors);
      $(feed).find('.ui.header').css('color', '#fff').removeClass(this.acceptedColors);
      $(feed).find('.summary>.date').css('color', 'rgba(255,255,255,0.6)');
      $(feed).find('.summary').css('color', 'rgba(255,255,255,0.6)');
      $(feed).find('.summary>span>a').css('color', 'rgba(255,255,255,1)');
      $(feed).find('.extra.text').css('color', '#fff');
      $(feed).find('.meta>span').css('color', 'rgba(255,255,255,0.65)');
      $(feed).find('.meta>span>a').css('color', 'rgba(255,255,255,0.4)');
    } else if (!active) {
      $('.segment.theme').removeClass('inverted raised');
      $('h4').addClass(this.settings.theme.color);
      $(feed).find('.ui.header').addClass(this.settings.theme.color);
      $(feed).find('.summary>.date').css('color', 'rgba(0,0,0,.4)');
      $(feed).find('.summary').css('color', 'rgba(0,0,0,.4)');
      $(feed).find('.summary>span>a').css('color', '#4183c4');
      $(feed).find('.extra.text').css('color', '#000');
      $(feed).find('.meta>span').css('color', 'rgba(0,0,0,.6)');
      $(feed).find('.meta>span>a').css('color', 'rgba(0,0,0,.6)');
    }

  }

  initUI() {
    $('.ui.segment').on('mouseenter', function () {
      $(this).find('span.handle').css('opacity', '0.5');
    }).on('mouseleave', function () {
      $(this).find('span.handle').css('opacity', '0');
    });

    $('.timeRange.min').calendar({
      onChange: (value) => {
        this.settings.layout.timeRange.min = value;
        setTimeout(() => {
          this.saveSettings();
          this.loadTweets();
        }, 2000);
      }
    });
    $('.timeRange.max').calendar({
      onChange: (value) => {
        this.settings.layout.timeRange.max = value;
        setTimeout(() => {
          console.log('calendar change')
          this.saveSettings();
          this.loadTweets();
        }, 2000);

      }
    });
    $('.ui.dropdown').dropdown({
      onChange: () => {
        this.saveSettings();
      }
    });
    $('#count').on('change', () => {
      setTimeout(() => {
        this.saveSettings();
        this.loadTweets();
      }, 1000);
    });
  }

}

interface Settings {
  theme: {
    isInverted: boolean,
    color: String,
  };
  layout: {
    order: any,
    count: Number,
    timeRange: {
      min: Date,
      max: Date
    }
  };
}
