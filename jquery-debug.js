;(function($){
    
    var console = window.console;
    
    if (typeof console == 'object') {
    } else if (typeof opera == 'object') {
        console = {
            log : function(){
                opera.postError.apply(opera, arguments);
            }
        };
    } else {
        var _logdiv = $('<div>').attr({
            id : '_console_log'
        }).css({
            position:'fixed',
            'z-index':'100000',
            background:'#fcc',
            color:'black',
            'font-family':'monospace',
            'white-space':'pre',
            'border':'1px solid black',
            'overflow':'auto',
            'height':'20%',
            'width':'20%'
        }).click(function(){this.hide();});
        console = {
                log : function(){
                    var args = $.map($.each(arguments, function(i, v){
                        return $('<div>').css({'border-bottom':'1px solid #888'}).text($.toJSON(v).replace(/,/g, ",\n"));
                    }));
                    _logdiv.show().append(args).scrollTop(10000);
                }
            };
    }
    
    $.extend({
        log : function(){
            console.log.apply(console, arguments);
        }
    });
    $.fn.extend({
        log : function(){
            console.log.apply(console, Array.prototype.concat(arguments, this));
        }
    });

})(jQuery);