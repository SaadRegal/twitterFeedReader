import {Component, OnInit} from '@angular/core';
import {DragulaService} from 'ng2-dragula';

declare let $: any;

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {

  users=['makeschool','newsycombinator','ycombinator'];
  columns = ['feed1', 'feed2', 'feed3'];
  time: {
    start: Date,
    end: Date
  };

  setting:{
    theme:{
      isInverted:String,
      color:String,
    }
  }
  isInverted=false;
  acceptedColors = 'blue purple pink teal green grey orange';

  constructor(private dragulaService: DragulaService) {
    dragulaService.createGroup("FEED", {
      direction: 'horizontal',
      moves: (el, container, handle) => {
        return handle.classList.contains('move');
      }
    });

    if(localStorage.getItem('setting')){

    }
  }

  ngOnInit() {
    this.initUI();
    this.changeTheme('blue');
  }

  


  showSettings() {
    $('.ui.sidebar').sidebar({silent: true}).sidebar('show');
  }

  changeTheme(color) {
    $('.theme').removeClass(this.acceptedColors)
    $('.theme').addClass(color);
    this.invertedTheme(this.isInverted)
  }

  invertedTheme(active) {
    this.isInverted=active;
if(active){
  //Setting inverted style
  $('.segment.theme').addClass('inverted');
  $('h4').removeClass(this.acceptedColors);
  $('.ui.feed').find('.summary>a').css('color', '#fff');
  $('.ui.feed').find('.summary>.date').css('color', '#eeeeee')
  $('.ui.feed').find('.extra.text').css('color', '#fff');
  $('.ui.feed').find('.meta>a').css('color', '#eeeeee');
}else{
  $('.segment.theme').removeClass('inverted');
  $('.ui.feed').find('.summary>a').css('color', '#4183c4');
  $('.ui.feed').find('.summary>.date').css('color', 'rgba(0,0,0,.4)');
  $('.ui.feed').find('.extra.text').css('color', '#000');
  $('.ui.feed').find('.meta>a').css('color', 'rgba(0,0,0,.4)');
}

  }

  initUI() {
    $('.ui.segment').on('mouseenter', function () {
      $(this).find('span.handle').css('opacity', '0.5');
    }).on('mouseleave', function () {
      $(this).find('span.handle').css('opacity', '0');
    });

    $('.timeRange').calendar();
    $('.ui.dropdown').dropdown();
  }

}
