;(function($, window, document, undefined){

  var 
    defaults = {
      color: "rgba(0,0,0,0.5)",
      spacing : 5,
      event : 'click'
    };


  // debounce is shamefully stolen from underscore.js , here's their license 

  /*
  Copyright (c) 2009-2013 Jeremy Ashkenas, DocumentCloud

  Permission is hereby granted, free of charge, to any person
  obtaining a copy of this software and associated documentation
  files (the "Software"), to deal in the Software without
  restriction, including without limitation the rights to use,
  copy, modify, merge, publish, distribute, sublicense, and/or sell
  copies of the Software, and to permit persons to whom the
  Software is furnished to do so, subject to the following
  conditions:

  The above copyright notice and this permission notice shall be
  included in all copies or substantial portions of the Software.

  THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
  EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES
  OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
  NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
  HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
  WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
  FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR
  OTHER DEALINGS IN THE SOFTWARE.
  */

  function debounce(func, wait, immediate) {
    var timeout, result;
    return function() {
      var context = this, args = arguments;
      var later = function() {
        timeout = null;
        if (!immediate) {
          result = func.apply(context, args);
        }
      };
      var callNow = immediate && !timeout;
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
      if (callNow) {
        result = func.apply(context, args);
      }
      return result;
    };
  }      


  // developer.mozilla.org/en/CSS/pointer-events

  // Test and project pages:
  // ausi.github.com/Feature-detection-technique-for-pointer-events/
  // github.com/ausi/Feature-detection-technique-for-pointer-events/wiki
  // github.com/Modernizr/Modernizr/issues/80

  function supportsPointerEvents (){
    var element = document.createElement('x'),
        documentElement = document.documentElement,
        getComputedStyle = window.getComputedStyle,
        supports;
    if(!('pointerEvents' in element.style)){
        return false;
    }
    element.style.pointerEvents = 'auto';
    element.style.pointerEvents = 'x';
    documentElement.appendChild(element);
    supports = getComputedStyle &&
        getComputedStyle(element, '').pointerEvents === 'auto';
    documentElement.removeChild(element);
    return !!supports;    
  }

  function CanvasMask(el, options){
    this.el = $(el);
    //default to click as mouseleave is not working properly without pointerevents support
    if (supportsPointerEvents() === false){
      options.event = 'click';
    }

    this.options = $.extend( { target : this.el } , defaults, options );

    this.canvas = this.buildCanvas();    

    this.events();
  }

  CanvasMask.prototype.buildCanvas = function(){
    var 
      canvas, prev, 
      dims = this.getDimensions();

    canvas = $('<canvas class="canvasmask"/>');
    canvas.attr('width', dims.width);
    canvas.attr('height', dims.height);

    if (this.options.event === 'hover'){
      canvas.css('pointer-events','none');
    }    

    //we want to transition if we add another canvas when previous still exists
    prev = $('canvas.canvasmask');
    if (prev.length) {
      prev.remove();
      canvas.addClass('canvasmask-active');
    }     

    return canvas;   
  };

  CanvasMask.prototype.redraw = function(){
    var 
      dims = this.getDimensions(),
      ctx = this.canvas.get(0).getContext('2d');

    //empty previous drawing
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    
    this.canvas.attr('width', dims.width);
    this.canvas.attr('height', dims.height);

    ctx.fillStyle = this.options.color;
    ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    ctx.globalCompositeOperation = 'destination-out'; 
    ctx.fillStyle = 'rgb(0,0,0)';

    $(this.options.target).each($.proxy(function(index, el){
      var 
        x = $(el).offset().left - this.options.spacing,
        y = $(el).offset().top - this.options.spacing,
        w = $(el).outerWidth() + this.options.spacing * 2,
        h = $(el).outerHeight() + this.options.spacing * 2;

      ctx.fillRect(x, y, w, h);
    },this));
  };

  CanvasMask.prototype.getDimensions = function(){
    return {
      width : Math.max($(window).width(), $(document).width()),
      height : Math.max($(window).height(), $(document).height())
    };
  };

  CanvasMask.prototype.close = function(){
    
    //animation
    this.canvas.removeClass('canvasmask-active');
    
    window.setTimeout($.proxy(function(){
      this.canvas.detach();
    },this), 350);
  
    return false;  
  };

  CanvasMask.prototype.open = function(){
    this.canvas.appendTo('body');      
    this.redraw();
    this.canvas.addClass('canvasmask-active');
    $(document).on('keydown',$.proxy(this.keydown, this)); 
  };

  CanvasMask.prototype.keydown = function(e){
    if (e.keyCode === 27) { 
      this.close();
      $(document).off('keydown',this.keydown);
    }
  };

  CanvasMask.prototype.events = function(){
    this.canvas.on('click', $.proxy(this.close, this));

    $(window).on('resize', debounce($.proxy(this.redraw, this), 100));

    if (this.options.event === 'hover') {
      return this.el.hover($.proxy(this.open, this), $.proxy(this.close, this));  
    }    

    if (this.options.event === 'click'){
      return this.el.on('click', $.proxy(this.open,this));
    }      
  };

  $.fn.canvasMask = function ( options ) {
    return $(this).each(function(){

      var cm = $(this).data('canvasmask');
      
      if (options === 'open'){
        if (!cm) {
          throw "Mask not initialized";
        }
        return cm.open();
      }

      if (options === 'close'){
        if (!cm) {
          throw "Mask not initialized";
        }
        return cm.close();
      }      

      cm = new CanvasMask( this , options );
      return $(this).data('canvasmask' , cm);
    });
  };

}(jQuery, window, document));