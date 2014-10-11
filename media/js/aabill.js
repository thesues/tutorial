var date_offset = 0   //date offset from today
var date_text = ''    //date text ("2008/06/01")

var inputing        //what is being inputted by soft keyboard
var inputing_type   // 'prepay' or 'factor'
var inputing_index  // list[inputint_index][input_type]

var req         //XMLHttpRequest handle
var fullscreen  //fullscreen div handle


/*
 * make the post content string from activity, date and list
 *
 * activity = 'lunch'
 * date = '2008/06/01'
 * list = [
 *   {'name':'mengcong', 'participant':1, 'consume':10, 'prepay':50},
 *   ...
 * ]
 * json use " to represent string
 */
function list2str()
{
  var str = 'activity=' + document.getElementById('activity').value + '&'
  str += 'date=' + date_text + '&'
  str += "list=["

  for (var i in list)
  {
      val = list[i]
      str += "{"
      /*
         quotes = (typeof(val[j]) == 'string') ? "\"" : ""
         str += "\"" + j + "\":" + quotes + val[j] + quotes// + ","
         if ()
         str += ","
         */
      str += "\"name\":" + "\"" + val.name + "\"" + "," 
      str += "\"consume\":" + val.consume  + ","
      str += "\"prepay\":" + val.prepay
      str += "}"
      if (i < list.length - 1)
         str +="," 
  }

  str += "]"

  return str
}


/*
 * readyStat & status: http://www.xul.fr/en-xml-ajax.html
 * response text as below:
 *
 * activity_id=124
 * activity_list=["lunch", "dinner"]
 * list=[
 *   {"name":"mengcong", "email":"cmeng@novell.com", "remain":-50.0},
 *   ...
 * ]
 *
 */
function load_callback()
{
  if (req.readyState==4 && req.status==200)
  {
    eval(req.responseText);
    for (i in list)
    {
      list[i]['participant'] = 0
      list[i]['factor'] = 1
      list[i]['consume'] = 0
      list[i]['prepay'] = 0
    }

    for (i in activity_list)
    {
      var item = new Option(activity_list[i], activity_list[i]);
      document.getElementById('activity_select').options.add(item);     
    }

    update_view()
    return
  }

  if (req.readyState==4 && req.status!=200)
    show_alert('Loading Failed(' + req.status + ')', true)
}


function do_load()
{
  req = new XMLHttpRequest();
  req.onreadystatechange = load_callback;
  req.open('GET', '/aabill/api/compact_load/', true);
  req.send(null);
}


function save_callback()
{
  if (req.readyState==4 && req.status==200)
  {
    for (i in list)
    {
      list[i]['remain'] += list[i]['prepay'] - list[i]['consume']
      list[i]['consume'] = list[i]['prepay'] = 0
    }
    update_view()
    show_alert_text("Saving...      Done")
    show_alert_btn(true)
  }

  if (req.readyState==4 && req.status!=200)
  {
    show_alert_text("Saving...     Fail(" + req.status + ')')
    show_alert_btn(true)
  }
}


function do_save()
{
  show_alert("Saving...", false)
  req = new XMLHttpRequest()
  req.onreadystatechange = save_callback;
  req.open('POST', '/aabill/api/submitprocess/', true);
  req.setRequestHeader("Content-Type", "application/x-www-form-urlencoded")
  req.send(list2str())
}


function show_alert_text(text)
{
  var div=document.getElementById("alert_text") 
  div.innerHTML='<pre>' + text + '</pre>'
}


function show_alert_btn(btn)
{
  var div=document.getElementById("alert_btn") 
  div.innerHTML = btn ? '<input type=button value="  OK  " onclick=stop_fullscreen()></input>' : ''
}


/*
 * show a alert windown
 * text: text to show
 * btn:  show close button(boolean)
 * div:  id:alert
 */
function show_alert(text, btn)
{
  start_fullscreen()
  fullscreen.innerHTML='<div id=alert class=alert><div id=alert_text class=alert-text></div><div id=alert_btn class=alert-btn></div></div>'
  show_alert_text(text)
  show_alert_btn(btn)
}


/*
 * start a full screen div
 * div:   handle:fullscreen
 */
function start_fullscreen()
{
  fullscreen = document.createElement("div");
  fullscreen.setAttribute("class", "fullscreen")
  fullscreen.innerHTML=''
  document.body.appendChild(fullscreen);
}


/*
 * remove the full screen div
 */
function stop_fullscreen()
{
  document.body.removeChild(fullscreen);
}


// digital button handler
function digit_btn(i)
{
  if (inputing.length==4) return
  if (inputing=="0")
    inputing = "" + i
  else
    inputing += i
  
  list[inputing_index][inputing_type] = eval(inputing)
  update_view()
}


// backspace button handler
function backsp_btn()
{
  if (inputing.length==0) inputing=list[inputing_index][inputing_type]+""
  inputing=inputing.substr(0, inputing.length-1)
  list[inputing_index][inputing_type] = ((inputing.length>0) ? eval(inputing) : 0)
  update_view()
}


// done(finish) button handler
function done_btn()
{
  stop_fullscreen()
}


/*
 * show soft keyboard
 * e:evnet   type:"factor"|"prepay"   index:index of list
 *
 * keyboard div:  full screen div
 * digit button:  onclick=digit_btn(<n>)
 * back  button:  onclick=backsp_btn()
 * done  button:  onclick=done_bk()
 */
function show_kb(e, index, type)
{
  inputing = ""
  inputing_type = type
  inputing_index = index

  start_fullscreen()
  fullscreen.innerHTML='\
    <div class=soft-kb style="left:' + e.clientX + ';top:' + e.clientY + '">\
      <input class=soft-kb-but type=button onclick="digit_btn(1)" value=1></input>\
      <input class=soft-kb-but type=button onclick="digit_btn(2)" value=2></input>\
      <input class=soft-kb-but type=button onclick="digit_btn(3)" value=3></input></br>\
      <input class=soft-kb-but type=button onclick="digit_btn(4)" value=4></input>\
      <input class=soft-kb-but type=button onclick="digit_btn(5)" value=5></input>\
      <input class=soft-kb-but type=button onclick="digit_btn(6)" value=6></input></br>\
      <input class=soft-kb-but type=button onclick="digit_btn(7)" value=7></input>\
      <input class=soft-kb-but type=button onclick="digit_btn(8)" value=8></input>\
      <input class=soft-kb-but type=button onclick="digit_btn(9)" value=9></input></br>\
      <input class=soft-kb-but type=button onclick="digit_btn(0)" value=0></input>\
      <input class=soft-kb-but type=button onclick="backsp_btn()" value="←"></input>\
      <input class=soft-kb-but type=button onclick="done_btn()"   value="√ "></input>\
    </div>\
  '
}


/*
 * caculate every participant's consuming value
 */
function calc_consume()
{
  var factors=0  //sum factor of all participants
  var odd=0      //sum odd (in cent)
  var prepay=0   //sum prepay

  for (var index in list)
    if (list[index]['participant']>0.1)
    {
      prepay+=list[index]['prepay']
      factors+=list[index]['factor']
    }

  for (var index in list)
    if (list[index]['participant']>0.1)
    {
      ppf = prepay / factors + 0.00000009
      if (isNaN(ppf)) ppf=0
      i = ppf * list[index]['factor']
      i = Math.floor(i * 10 + 0.9) / 10
      list[index]['consume'] = i
    }

  odd = prepay
  for (var index in list)
    if (list[index]['participant']>0.1)
      odd -= list[index]['consume']

  for (var index in list)
    if (list[index]['participant']>0.1 && list[index]['prepay']>0.1)
{
      list[index]['consume'] += odd / prepay * list[index]['prepay']
//  alert(odd / prepay * list[index]['prepay'])
}


  for (var index in list)
    if (list[index]['participant']>0.1)
      list[index]['consume'] = Math.floor(list[index]['consume'] * 100 + 0.09)/100
}
function calc_consume_bak()
{
  var sum_prepay=0, sum_factor=0, extra=0
  for (var index in list)
  {
    if (!list[index]["participant"]) continue;
    sum_prepay+=list[index]["prepay"]
    sum_factor+=list[index]["factor"]
  }

  for (var index in list)
  {
    if (!list[index]["participant"]) continue;
    var i = sum_prepay / sum_factor * list[index]["factor"]
    if (isNaN(i)) i = 0
    i = Math.round(i*100)
    var j = i % 10
    if (j)
    {
       extra += (10 - j) 
       i += (10 - j)
    }
    list[index]["consume"] = i / 100
  }

  for (var index in list)
    if (extra>0 && list[index]["participant"])
    {
       list[index]["consume"] -= Math.round(extra / sum_prepay * list[index]["prepay"]) / 100
       list[index]["consume"] = Math.round(list[index]["consume"]*100)/100
    }      
}
function calc_consume_bak1()
{
  var sum_prepay=0  //sum of prepay
  var par_factor=0  //sum factor of all participants
  var prepay_factor=0  //sum factor of all prepayers 

  var part1=0  // total pay of non-prepayers
  var part2=0  // total pay of prepayers              part1+part2==sum_prepay

  var par_ppf=0    //pay per factor of participants
  var prepay_ppf=0 //pay per factor of prepayers

  sum_prepay = par_factor = prepay_factor = 0
  for (var index in list)
  {
    if (list[index]["participant"]>0.01)
    {
      sum_prepay+=list[index]["prepay"]
      par_factor+=list[index]["factor"]
      if (list[index]['prepay'])
         prepay_factor += list[index]['factor']
    }
  }
  ppf = Math.floor(sum_prepay / par_factor * 10 + 0.9) / 10
  if (par_factor<0.1) ppf = 0

  // calc 'consume' of non-prepayers
  part1 = 0
  for (var index in list)
  {
    if (list[index]["participant"] && !(list[index]['prepay']>0.01))
    {
      list[index]['consume'] = Math.floor(ppf * list[index]['factor'] * 100 + 0.09) / 100
      if (list[index]['consume'] > sum_prepay) list[index]['consume'] = sum_prepay
      part1 += list[index]['consume']
    }
  }

  // calc 'consume' of prepayers
  part2 = sum_prepay - part1
  ppf = part2 / prepay_factor
  if (prepay_factor<0.1) ppf = 0

  if (isNaN(ppf)) ppf = 0
  for (var index in list)
    if (list[index]["participant"] && list[index]['prepay']>0.01)
      list[index]['consume'] = Math.floor(ppf * list[index]['factor'] * 100 + 0.09) / 100
}


/*
 * callback function of scroll event on factor or prepay
 * id: factor-scroll-<index> or prepay-scroll-<index>
 */
function do_scroll(e)
{
  var id = e.target.id;

  // get "factor" or "prepay"
  type = id.substring(0, id.indexOf('-'))
  index = id.substr(id.lastIndexOf('-') + 1)

  var delta = e.detail > 0 ? -1 : 1;
  var value = list[index][type] + delta;
  if (value < 0) value = 0;
  list[index][type] = value;
  update_view()
}

/*
 * callback function of member item clicking
 * index: index of list array
 */
function do_member_click(index)
{
  index = eval(index)
  list[index]["participant"] = 1 - list[index]["participant"]
  calc_consume()
  update_view()
}

/*
 * update the right view (participants list)
 * factor value  div:   id:factor-<index>
 * factor scroll div:   id:factor-scroll-<index>   onclick:show_kb(event, <index>, "factor")   onscroll:do_scroll(event)
 * consume value div:   id:consume-<index>
 * prepay value  div:   id:prepay-<index>
 * prepay scroll div:   id:prepay-scroll-<index>   onclick:show_kb(event, <index>, "prepay")  onscroll:do_scroll(evnet)
 */
function update_right()
{
  var inner_html = ""
  var right_frame = document.getElementById("rightframe");

  for (var index in list)
  {
    if (!list[index]["participant"]) continue
    var prepay_class = (list[index]["prepay"] ? 'prepay-nonezero' : 'prepay-zero');

    // make divs: name, factor, factor-scroll, consume, prepay and prepay-scroll
    inner_html+='\
    <div class=consumer-box id=c-box>\
      <div class=consumer-name>' + list[index]["name"] + '</div>\
      <div class=consumer-multiply>x<thevalue id=factor-' + index + '>' + list[index]["factor"] + '</thevalue></div>\
      <div class=mul-scroll-box id=factor-scroll-' + index + ' onclick="show_kb(event, \'' + index + '\', \'factor\')"></div>\
      <div class=consumer-minus>-<thevalue id=consume-' + index + '>' + (list[index]["consume"]) + '</thevalue></div>\
      <div class=' + prepay_class + '>+<thevalue id=prepay-' + index + '>' + list[index]["prepay"] + '</thevalue></div>\
      <div id=prepay-scroll-' + index +' onclick="show_kb(event, \'' + index + '\', \'prepay\')" class=plus-scroll-box></div>\
    </div>\
    '
  }

  right_frame.innerHTML=inner_html;

  // add scroll evnet listener
  for (var index in list)
  {
    if (!list[index]["participant"]) continue

    var mybox = document.getElementById("factor-scroll-" + index);
    mybox.addEventListener("DOMMouseScroll", do_scroll, false);

    var mybox = document.getElementById("prepay-scroll-" + index);
    mybox.addEventListener("DOMMouseScroll", do_scroll, false);
  }
}


/*
 * update the left view (member item list)
 * member item div id: member-<index>  onlick: do_member_click(<index>)
 */
function update_left()
{
  var inner_html = ""
  var left_frame = document.getElementById("leftframe");

  for (var index in list)
  {
    member_class = list[index]["participant"] ? "member-item-selected" : "member-item"

    var remain = list[index]['remain']
    if (list[index]['participant']) remain += list[index]['prepay'] - list[index]['consume']
    remain = Math.floor(remain*100)/100

    sign = (remain>0) ? '+' : ''

    inner_html += '<div class=' + member_class + '>'
    inner_html += list[index]["name"]
    inner_html += '<adiv style="position:absolute; left:55%;">' + sign + remain + '</adiv>'
    inner_html += '<div class=member-item-layout id=member-' + index + ' onclick="do_member_click(' + index + ')"> </div>'
    inner_html += '</div>'
  }

  left_frame.innerHTML = inner_html;
}


// disable/enable save button
function disable_save()
{
  t = 0
  for (index in list)
    if (list[index]['participant']) t += list[index]['consume']

  activity = document.getElementById('activity').value
  document.getElementById('save_btn').disabled = (!t) || activity == "pick an activity"
}

/*
 * change the date
 * delta: 0:today  -1:previous day  1:next day  <other>:not change just display
 */
function change_date(delta)
{
  if (delta == 0)
    date_offset = 0
  else if (delta == 1 || delta == -1)
    date_offset += delta

  if (date_offset > 0) date_offset = 0

  t = new Date(Date.now() + date_offset*24*60*60*1000)
  y = t.getFullYear()
  m = t.getMonth() + 1
  d = t.getDate() 
  w = t.getDay() ? t.getDay() : 7

  //date_text = y + '/' + Math.floor(m/10) + m%10 + '/' + Math.floor(d/10) + d%10 + '(' + w + ')'
  date_text = y + '-' + Math.floor(m/10) + m%10 + '-' + Math.floor(d/10) + d%10
  document.getElementById('date').innerHTML = date_text
}


/*
 * update the whole page
 */
function update_view()
{
  change_date(2)
  calc_consume()
  disable_save()
  update_left()
  update_right()
}

var translate_table = [
	{name:"还钱", pinyin: "HQ"},
	{name:"羽毛球", pinyin:"YMQ"},
	{name:"味千", pinyin: "WQ"},
	{name:"国贸烤翅", pinyin: "GMKC"},
	{name:"橘子洲头", pinyin: "JZZT"},
	{name:"麻辣香锅", pinyin: "MLXG"},
	{name:"康师傅", pinyin: "KSF"},
	{name:"阿伯丁", pinyin: "ABD"},
	{name:"虾粥", pinyin: "XZ"},
	{name:"米粉", pinyin: "MF"},
	{name:"太熟悉", pinyin: "TSX"},
	{name:"千味", pinyin: "QW"},
	{name:"爆肚冯", pinyin:"BDF"},
	{name:"宏状元", pinyin:"HZY"},
	{name:"金彩虹", pinyin:"JCH"},
	{name:"陕西面馆", pinyin:"SXMG"},
	{name:"真功夫", pinyin:"ZGF"},
	{name:"海底捞", pinyin:"HDL"},
	{name:"B3", pinyin:"B3"},
	{name:"大食代", pinyin:"DSD"},
	{name:"电影", pinyin:"DY"},
	{name:"合利屋", pinyin:"HLW"},
	{name:"隆福寺", pinyin:"LFS"},
	{name:"家常菜", pinyin:"JCC"},
	{name:"双井电影院", pinyin:"SJDYY"},
	{name:"Melody", pinyin:"Melody"},
	{name:"麻辣花生", pinyin:"MLHS"},
	{name:"老邹家常菜", pinyin:"LZJCC"},
	{name:"金湖茶餐厅", pinyin:"JHCCT"},
	{name:"驴肉", pinyin:"LR"},
	{name:"麻辣诱惑", pinyin:"MLYH"},
	{name:"大碗菜", pinyin:"DWC"},
	{name:"双皮奶", pinyin:"SPN"},
	{name:"驴肉火烧", pinyin:"LRHS"},
	{name:"小笼包", pinyin:"XLB"},
	{name:"螺蛳粉", pinyin:"LSF"},
	{name:"沙县小吃", pinyin:"SXXC"},
	{name:"二楼按摩", pinyin:"ELAM"},
	{name:"雕刻时光", pinyin:"DKSG"},
	{name:"打车", pinyin:"DC"},
	{name:"出租车", pinyin:"CZC"},
	{name:"塔里木", pinyin:"TLM"},
	{name:"happyV", pinyin:"happyV"},
	{name:"上手屋", pinyin:"SSW"},
	{name:"Subway", pinyin:"Subway"},
	{name:"充值", pinyin:"CZ"},
	{name:"味千拉面", pinyin:"WQLM"},
	{name:"足球", pinyin:"ZQ"},
	{name:"湘肠湘", pinyin:"XCX"},
	{name:"大时代", pinyin:"DSD"},
	{name:"汉拿山", pinyin:"HNS"},
	{name:"订饭", pinyin:"DF"},
	{name:"小百合", pinyin:"XBH"},
	{name:"赛百味", pinyin:"SBW"},
	{name:"老鸭汤", pinyin:"LYT"},
	{name:"宏状元粥", pinyin:"HZYZ"}
];

$().ready(function() {
	$("#activity").autocomplete(translate_table, {
		minChars:0,
		width:170,
		matchContains: "word",
		autoFill: false,
		matchContains: true,
		formatItem: function (row, i, max) {
			//return i + "/" + max + ": \"" + row.name + "\"[" + row.to + "]";
			return row.name;
		},
		formatMatch: function (row, i, max) {
			return row.name + " " + row.pinyin;
		},
		formatResult: function (row) {
			return row.name;
		}
	});
});
