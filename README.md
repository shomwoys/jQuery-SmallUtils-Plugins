jQuery Plugins
==============

This repository provides small utils for jQuery.

Better typeof(), make closure, Date utils, Number utils, URLize, form utils and HTML based template.


jquery-utils.js
--------------

Small utils.

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


jquery-urlize.js
----------------

### URLize ( text to HTML with URLized/&lt;BR&gt; )

    $.urlize(text)

Convert text to escaped html.
'http://...','https://...','ftp://...' convert to to &lt;a> and linebreaks convert to &lt;br>

    $().urlize(text)

urlized $().text(text)

ex)

    $('div').urlize(
        "This text is urlized and linebreaksbred.\n"
        + "http://www.jquery.com/ urlized to <a target="_taret" href="http://www.jquery.com/">http://www.jquery.com</a>,\n"
        + "and all linebreaks converted to <br>"
    )



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

	$(form).formPost(opts)

ex)

    <form>
        <span class="error_msg" data-for="@all">error for all placeholder</span>
        <input name='text1'><span class="error_msg" data-for="text1">error for text1 placeholder</span><br>
        <input name='text2'><span class="error_msg" data-for="text2">error for text2 placeholder</span><br>
        <input type="submit">
    </form>
    <script>
    $(function(){
        $('form').submit(function(){
            $(this).formPost()
            .then(function(res){
                location.href="post_success.html";
            }).fail(function(res){
                if (res.systemerror) { alert('failed for some server reason:'+res.systemerror; }
                if (res.ajaxerror) { alert('failed for some netowrk reason:'+res.ajaxerror; }
            });
            return false;
        }).find('.error_msg[data-for]').css('display':'none');
    });
    </script>

expected server response:

    success
        -> { success:true; }
    validation error
        -> {
                errors:{
                    '<field name>:'<reason>'
                             :
                }
           }
    serverside system error
        -> { systemerror:'<reason>'; }


jquery-datatmpl.js
------------------

HTML DOM based template.

    $(elem).dataTmpl(context, options)
    or
    var tmpl = new $.DataTmpl(target);
    tmpl.render(context);

This tempalte mapped object values to HTML elements with 'data-tmpl' (as key of values).

ex)

    <script>
    $(function(){
    $("target").dataTmpl({
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
        },
    });
    });
    </script>
    
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

DataTmpl object can update dynamically.

    tmpl.update(extend_context);
    tmpl.spliceRows("<key for array>", position, delete_count, insert_array);
    tmpl.appendRows("<key for array>", insert_array);
    tmpl.prependRows("<key for array>", insert_array);
    tmpl.insertRows("<key for array>", pos, insert_array);
    tmpl.deleteRows("<key for array>", pos, delete_count);

ex)
    tmpl.update({ "array":[{ data:"updated row1"}] });
        -> replace context.array to [ { data:"updated row1" } ] and refresh all
    tmpl.appendRows("array", [{ data:"row1" }, { data:"row2" }]);
        -> append [{ data:"row1" }, { data:"row2" }] to context.array and append new elements
    tmpl.deleteRows("array", 1, 2);
        -> delete context.array[1],context.arra[2] and remove elements 
