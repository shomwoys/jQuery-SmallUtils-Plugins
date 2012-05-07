jQuery Plugins
==============

jquery-utils.js
--------------

some small utils for jQuery

### better typeof

    $.typeOf(v)
    -> "null","undefined","boolean","number","string","array","date","regexp","object"

### make closure function

    $.closure(args,thisobj,func)

ex)

    var f = $.closure([1,2],{a:3},function(_a,_b,c){print _a,_b,c,this});
    f(4);
    -> 1,2,4,{a:3}

### $.Deferred setTimeout (with closure)

    $.doLater(func,delay);
    $.doLaterWith(args, thisobj, func,delay);

ex)

    $.doLater(function(){print '1'}).then(function(){
    	print 'success';
    },100).fail(function(ex){
    	alert('exception:'+ex.toString():);
    });
    $.doLaterWith([1,2],null,function(_a,_b){print _1}).then(function(){
    	print 'success';
    },100).fail(function(ex){
    	alert('exception:'+ex.toString():);
    });

### Date utils

#### parse ISO8601 string to Date()

    $.parseISO8601('1970-01-01T00:00:00Z');
    -> Date(0)

#### format Date() to String by format

    $.dateformat(date,formatstr)

ex)

	$.dateformat(new Date(0), 'yyyy/MM/dd HH:mm');
	-> "1970/01/01 00:00" (localtime)

### Number utils

#### comma separated string for number

    $.numformat.comma3(1234)
    -> "1,234"
    $.numformat.comma3(1234.5678)
    -> "1,234.5678"

#### round any decimal position and padding 0

	$.numformat.round(num, posisition, pad0_flag)

ex)

	$.numformat.round(1.445, -2) -> 1.45
	$.numformat.round(1.499, -2) -> 1.50
	$.numformat.round(149,1) -> 150


#### kilo, mega (shortcut: round(num, 1024, false),round(num, 1024*1024, false)

    $.numformat.kilo(1024*10)
    -> 10
    $.numformat.mega(1024*1024*10)
    -> 10


### Resolve object by String

    $.resolve({a:{b:{c:1}}}, 'b.c') -> 1
    $.resolve({a:{b:[{c:2}]}}, 'b[0].c') -> 2

[Example and Test](test/jquery-utils.html)


jquery-urlize.js
----------------

### URLize ( text to HTML with URLized/&lt;BR&gt; )

    $.urlize(text)

convert text to escaped html.
'http://...','https://...','ftp://...' convert to to &lt;a> and linebreaks convert to &lt;br>

    $().urlize(text)

urlized $().text(text)

ex)

    $('div').urlize(
        "This text is urlized and linebreaksbred.\n"
        + "http://www.jquery.com/ urlized to <a target="_taret" href="http://www.jquery.com/">http://www.jquery.com</a>,\n"
        + "and all linebreaks converted to <br>"
    )


[Example and Test](tests/jquery-urlize.html)


jquery-form.js
--------------

form values helper.

### Get form :input values as Object

    $(form).formGet()

ex)

    $('<form><input name="a" value="b"></form>')).formGet()
    -> {'a':'b'}
    $('<form>'
        +'<input name="a" value="b">'
        +'<input name="a" value="c">'
        +'</form>'
    ).formGet()
    -> {'a':['b','c']}


### Set form :input values with Object

    $(form).formSet(obj)

ex)

    $(form).formSet({
        'text':'value1',
        'cb':['chk1','chk3']
    });


### Clear form :input values

    $(form).formClear()

unset all input values in form - not 'reset'


### POST form by Ajax

	$(form).formPost()

ex)

    <form>
        <span class="error error_@all></span>
        <input name='text1'><span class="error error_text1><br>
        <input name='text2'><span class="error error_text2><br>
        <input type="submit">
    </form>
    <script>
    $(function(){
        $('form').submit(function(){
            $(this).formPost()
            .then(function(res){
                location.href="post_success.html"
            }).fail(function(res){
                if (res.systemerror) { alert('failed for some server reason:'+res.systemerror; }
                if (res.ajaxerror) { alert('failed for some netowrk reason:'+res.ajaxerror; }
            });
            return false;
        });
    });
    </script>

expected server return is below:

    success
        -> { success:true; }
    valication error
        -> {
                errors:{
                    '<field name>:'<reason>'
                }
           }
    serverside system error
        -> { systemerror:'<reason>'; }

[Example and Test](tests/jquery-form.html)
[Server side PHP mailform exmaple](tests/jquery-form-posttest.html)

jquery-datatmpl.js
------------------

HTML DOM base template.

This tempalte mapped object values to HTML elements with 'data-tmpl' (as key of values).

ex)

    $(target).dataTmpl({
        str:'string',
        nest:{
            nested:'nested'
        },
        array:[
            { data:1 },
            { data:2 }
        ],
        now:new Date(),
        html:{
            '@as_html':true,
            '@html':'some <b>HTML</b> contents',
            '@style':{ 'font-weight':'bold' },
            'class':'someclass'
        }
    });
    
    <target>
        <span data-tmpl="str">str placeholder</span>
        <div data-tmpl="nest">
            <div data-tmpl="nest.nested">nest.nested placeholder</div>
        </div>
        <div data-tmpl="array">
            <span data-tmpl="array:data>array[x].data placeholder</span>
        </div>
        <div data-tmpl="now">formatted as yyyy/MM/dd HH:mm:ss</div>
        <div data-tmpl="html">html placeholder</div>
    </target>

[Example and Test](tests/jquery-datatmpl.html)
