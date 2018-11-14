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

  constructor(private dragulaService: DragulaService) {
    dragulaService.createGroup('FEED', {
      direction: 'horizontal',
      moves: (el, container, handle) => {
        return handle.classList.contains('move');
      }
    });
    const localSettings = (localStorage.getItem('settings'));
    if (localSettings) {
      this.settings = JSON.parse(localSettings);
    } else {
      this.settings = {
        theme: {
          color: 'blue',
          isInverted: false
        }
      };
    }
  }

  users = ['makeschool', 'newsycombinator', 'ycombinator'];
  columns = ['feed1', 'feed2', 'feed3'];
  time: {
    start: Date,
    end: Date
  };
  settings: Settings;
  acceptedColors = 'blue purple pink teal green grey orange';


  ngOnInit() {
    this.initUI();
    this.loadSettings(this.settings);

  }

  loadSettings(settings: Settings) {
    this.changeTheme(settings.theme.color);
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
      $('.segment.theme').addClass('inverted');
      $('h4').removeClass(this.acceptedColors);
      $(feed).find('.ui.header').css('color', '#fff').removeClass(this.acceptedColors);
      $(feed).find('.summary>.date').css('color', '#eeeeee');
      $(feed).find('.extra.text').css('color', '#fff');
      $(feed).find('.meta>a').css('color', '#eeeeee');
    } else {
      $('.segment.theme').removeClass('inverted');
      $(feed).find('.ui.header').addClass(this.settings.theme.color);
      $(feed).find('.summary>.date').css('color', 'rgba(0,0,0,.4)');
      $(feed).find('.extra.text').css('color', '#000');
      $(feed).find('.meta>a').css('color', 'rgba(0,0,0,.4)');
    }

  }

  initUI() {
    $('.ui.segment').on('mouseenter', function () {
      $(this).find('span.handle').css('opacity', '0.5');
    }).on('mouseleave', function () {
      $(this).find('span.handle').css('opacity', '0');
    });

    $('.timeRange').calendar();
    $('.ui.dropdown').dropdown({
      onChange: () => {
        this.saveSettings();
      }
    });
  }

}

interface Settings {
  theme: {
    isInverted: boolean,
    color: String,
  };
}
