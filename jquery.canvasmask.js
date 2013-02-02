/* Modernizr 2.6.2 (Custom Build) | MIT & BSD
 * Build: http://modernizr.com/download/#-css_pointerevents
 */
;window.Modernizr=function(a,b,c){function t(a){i.cssText=a}function u(a,b){return t(prefixes.join(a+";")+(b||""))}function v(a,b){return typeof a===b}function w(a,b){return!!~(""+a).indexOf(b)}function x(a,b,d){for(var e in a){var f=b[a[e]];if(f!==c)return d===!1?a[e]:v(f,"function")?f.bind(d||b):f}return!1}var d="2.6.2",e={},f=b.documentElement,g="modernizr",h=b.createElement(g),i=h.style,j,k={}.toString,l={},m={},n={},o=[],p=o.slice,q,r={}.hasOwnProperty,s;!v(r,"undefined")&&!v(r.call,"undefined")?s=function(a,b){return r.call(a,b)}:s=function(a,b){return b in a&&v(a.constructor.prototype[b],"undefined")},Function.prototype.bind||(Function.prototype.bind=function(b){var c=this;if(typeof c!="function")throw new TypeError;var d=p.call(arguments,1),e=function(){if(this instanceof e){var a=function(){};a.prototype=c.prototype;var f=new a,g=c.apply(f,d.concat(p.call(arguments)));return Object(g)===g?g:f}return c.apply(b,d.concat(p.call(arguments)))};return e});for(var y in l)s(l,y)&&(q=y.toLowerCase(),e[q]=l[y](),o.push((e[q]?"":"no-")+q));return e.addTest=function(a,b){if(typeof a=="object")for(var d in a)s(a,d)&&e.addTest(d,a[d]);else{a=a.toLowerCase();if(e[a]!==c)return e;b=typeof b=="function"?b():b,typeof enableClasses!="undefined"&&enableClasses&&(f.className+=" "+(b?"":"no-")+a),e[a]=b}return e},t(""),h=j=null,e._version=d,e}(this,this.document),Modernizr.addTest("pointerevents",function(){var a=document.createElement("x"),b=document.documentElement,c=window.getComputedStyle,d;return"pointerEvents"in a.style?(a.style.pointerEvents="auto",a.style.pointerEvents="x",b.appendChild(a),d=c&&c(a,"").pointerEvents==="auto",b.removeChild(a),!!d):!1});

;(function($, window, document, undefined){

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
        if (!immediate) result = func.apply(context, args);
      };
      var callNow = immediate && !timeout;
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
      if (callNow) result = func.apply(context, args);
      return result;
    };
  };  


  var 
    defaults = {
      color: "rgba(0,0,0,0.5)",
      spacing : 5,
      event : 'click'
    };

  function getDimensions(){
    return {
      width : Math.max($(window).width(), $(document).width()),
      height : Math.max($(window).height(), $(document).height())
    };
  }      

  function canvasMask(el, options){

    el = $(el);

    var 
      canvas, ctx, 
      dims = getDimensions();

    options = $.extend({
      target : el 
    }, defaults, options);

    canvas = $('<canvas class="canvasmask"/>');
    canvas.attr('width', dims.width);
    canvas.attr('height', dims.height);

    if (Modernizr.pointerevents === false){
      options.event = 'click';
    };

    if (options.event === 'hover'){
      canvas.css('pointer-events','none');
    }

    var prev = $('canvas.canvasmask');

    if (prev.length) {
      prev.remove();
      canvas.addClass('canvasmask-active');
    }

    ctx = canvas.get(0).getContext('2d'); 

    function redraw (){
      var dims = getDimensions();

      //empty previous drawing
      ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
      
      canvas.attr('width', dims.width);
      canvas.attr('height', dims.height);

      ctx.fillStyle = options.color;
      ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
      ctx.globalCompositeOperation = 'destination-out'; 
      ctx.fillStyle = 'rgb(0,0,0)';

      $(options.target).each(function(){
        var 
          x = $(this).offset().left - options.spacing,
          y = $(this).offset().top - options.spacing,
          w = $(this).outerWidth() + options.spacing * 2,
          h = $(this).outerHeight() + options.spacing * 2;
        ctx.fillRect(x, y, w, h);
      });
    }

    function closeCanvas ( ) {
      canvas.removeClass('canvasmask-active');
      window.setTimeout(function(){
        canvas.detach();
      }, 350);
    
      return false;      
    }

    //events
    canvas.on('click', closeCanvas);

    function keydown(e){
      //esc key
      if (e.keyCode === 27) { 
        closeCanvas();
        $(document).off('keydown',keydown);
      }
    }

    function openCanvas ( ) {
      canvas.appendTo('body');      
      redraw();
      canvas.addClass('canvasmask-active');
      $(document).on('keydown',keydown);  
    }    

    $(window).on('resize', debounce(redraw, 100));

    if (options.event === 'click'){
      return el.on('click', openCanvas);
    }

    return el.hover(openCanvas, closeCanvas);
  }

  $.fn.canvasMask = function ( options ) {
    return $(this).each(function(){
      canvasMask(this, options);
    });
  };

}(jQuery, window, document));