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
          count: 10,
          order: ['MakeSchool', 'newsycombinator', 'ycombinator'],
          timeRange: {
            max: new Date(Date.now()),
            min: new Date(today.getFullYear(), today.getMonth(), today.getDate() - 5)
          }
        }
      };
    }
    this.tweets = [];
    this.colorArray = [];
  }

  settings: Settings;
  acceptedColors = 'blue purple pink teal green olive violet red orange black grey';
  colorArray: any;
  tweets: any;
  autoReloadTimer: any;


  ngOnInit() {
    this.loadTweets();
  }

  loadTweets() {
    this.tweets.length = 0;
    $('.noResult').remove();
    $('.feedColumn').css('display', 'none');
    $('.placeholderSegment').css('display', 'block');

    console.log('loading tweets');
    this.getTweets();
  }

  displayColumns() {
    this.loadSettings();
    this.initUI();
    $('.placeholderSegment').css('display', 'none');
    $('.feedColumn').css('display', 'block');
    this.exportJson();
  }

  async getTweets() {
    const users = this.settings.layout.order;
    for (let i = 0; i < users.length; i++) {
      console.log(i);
      // Loading data synchronously
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

    // for small screen
    $('.ui.modal').modal('hide');
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

    this.colorArray = this.acceptedColors.split(/(\s+)/).filter(function (e) {
      return e.trim().length > 0;
    });

    $('.ui.segment').on('mouseenter', function () {
      $(this).find('span.handle').css('opacity', '0.5');
    }).on('mouseleave', function () {
      $(this).find('span.handle').css('opacity', '0');
    });

    $('.min').calendar({
      onChange: (value) => {
        this.settings.layout.timeRange.min = value;
        this.autoReload();
      }
    });
    $('.max').calendar({
      onChange: (value) => {
        this.settings.layout.timeRange.max = value;
        this.autoReload();
      }
    });
    $('.ui.dropdown').dropdown();
    $('.ui.dropdown.colorsSelection').dropdown({
      onChange: (str, c, dom) => {

        const color = $('span', dom).text();
        console.log(color)
        this.changeTheme(color);
        this.saveSettings();
      }
    });
    $('#count').on('change keyup', () => {
      this.autoReload();
    });
    $('.showModal').on('click', () => {
      $('.ui.modal').modal('show');
    });
  }

  exportJson() {
    const str = JSON.stringify(this.tweets);
    const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(str);
    $('.exportData').attr('href', dataUri);
  }

  autoReload() {
    clearTimeout(this.autoReloadTimer);
    this.saveSettings();
    this.autoReloadTimer = setTimeout(() => {
      this.loadTweets();
    }, 2000);
  }

  saveAndReload() {
    $('.ui.modal').modal('hide');
    this.saveSettings();
    this.loadTweets();
  }

  clearSetting() {
    localStorage.clear();
    window.location.reload();
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
