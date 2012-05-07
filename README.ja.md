jQuery Plugins
==============

このレポジトリではjQuery用のちょっとしたプラグインを提供します。

typeof()改良版、クロージャ生成、Date関係、Number関係、URL文字列のリンク化、HTMLベースのテンプレートなど。


jquery-utils.js
--------------

小さなユーティリティ。

### typeof()改良版

    $.typeOf(v)
    -> "null","undefined","boolean","number","string","array","date","regexp","object"

### クロージャの生成(変数のバインド)

    $.closure(args,thisobj,func)

ex)

    var f = $.closure([1,2],{a:3},function(_a,_b,c){print _a,_b,c,this});
    f(4);
    -> 1,2,4,{a:3}

### $.Deferred化したsetTimeout

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

### Dateユーティリティ

#### ISO8601日時文字列をDate()に変換

    $.parseISO8601('1970-01-01T00:00:00Z');
    -> Date(0)

#### format Date() to String by format

    $.dateformat(date,formatstr)

ex)

	$.dateformat(new Date(0), 'yyyy/MM/dd HH:mm');
	-> "1970/01/01 00:00" (localtime)

### Numberユーティリティ

#### 数値を3桁カンマ区切り文字列に変換

    $.numformat.comma3(1234)
    -> "1,234"
    $.numformat.comma3(1234.5678)
    -> "1,234.5678"

#### 任意桁での四捨五入（および小数点以下0パディング)

	$.numformat.round(num, posisition, pad0_flag)

ex)

	$.numformat.round(1.445, -2) -> 1.45
	$.numformat.round(1.499, -2) -> 1.50
	$.numformat.round(149,1) -> 150


#### キロ・メガへの変換

    $.numformat.kilo(1024*10)
    -> 10
    $.numformat.mega(1024*1024*10)
    -> 10


### 文字列によるオブジェクトの子孫プロパティ値の取得

    $.resolve({a:{b:{c:1}}}, 'b.c') -> 1
    $.resolve({a:{b:[{c:2}]}}, 'b[0].c') -> 2


jquery-urlize.js
----------------

### URLize (テキスト内URLをリンクに変換＋改行をBRに変換)

    $.urlize(text)

textをHTMLエスケープし、http://,https://,ftp://を&lt;a&gt;リンクに変換し、改行文字を&lt;br&gt;に変換。


    $().urlize(text)

$().text(text)のurlize()版。

ex)

    $('div').urlize(
        "This text is urlized and linebreaksbred.\n"
        + "http://www.jquery.com/ urlized to <a target="_taret" href="http://www.jquery.com/">http://www.jquery.com</a>,\n"
        + "and all linebreaks converted to <br>"
    )



jquery-form.js
--------------

&lt;form&gt;値扱いのヘルパー。

### フォーム値をオブジェクトとして取得

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


### フォームにオブジェクト値をセット

    $(form).formSet(obj)

ex)

    $(form).formSet({
        'text':'value1',
        'cb':['chk1','chk3']
    });


### フォーム値をクリア

    $(form).formClear(clearHidden)

hiddenを除くすべての入力要素の値を空白にします（リセットとは別）。


### Ajaxによるフォームのポストおよびエラー表示処理

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

期待するサーバからのレスポンス：

    成功時
        -> { success:true; }
    入力エラー
        -> {
                errors:{
                    '<field name>:'<reason>'
                            :
                }
           }
    サーバ側システムエラー
        -> { systemerror:'<reason>'; }


jquery-datatmpl.js
------------------

HTML DOMベースのテンプレートユーティリティ。

    $(elem).dataTmpl(context, options)

オブジェクトのプロパティ値を、対応するdata-tmpl属性をもつHTML要素に設定する。
context.varnameの値は、data-tmpl="varname"の内容としてセットされる。

ex)

    <script>
    $(function(){
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

