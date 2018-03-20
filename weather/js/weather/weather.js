
function Weather() {
	this.Search=false;
	this.sum=0;
}

/*初始化注册事件*/
Weather.prototype.init = function() {
	var that=this;
	this.jsonp("http://api.map.baidu.com/api?v=2.0&ak=GGbplNTfcsp0s8gdQRkcsqvpnMjMwlhd&callback=weather.getCity");
	/*注册hashchange事件*/
	$(window).on("hashchange", function(e) {
		that.hashChange(location.hash);
	})
	/*注册BTN点击提交事件*/
	$("#cityform button").on("click",function(){
		if($("#name").val()=="")return;
		that.submit();
		return false;
	})

	/*阻止form默认的 键盘回车事件*/
	$('#cityform').on('keydown',function(e){
		if(e.keyCode==13){return false;}
	})
	/*阻止input默认的 键盘上下事件 并提交*/
	$("#name").on('keydown',function(e){
		weather.submit(e,this.value);
	})
}
/*jsonp请求接口*/
Weather.prototype.jsonp = function(url) {
	/*ajax获得当前地理位置*/
	
	$.getScript(url);
}
/*执行请求文件的callback并调用百度服务类*/
Weather.prototype.getCity = function() {
	
	this.localcity = this.localcity||new BMap.LocalCity();
	this.geocoder= this.geocoder||new BMap.Geocoder();
	var that = this;
	
	this.localcity.get(function(result) {
		/*获得当前地理位置,城市名称去掉最后"市、省、县"*/
		that.cityname = result.name.substr(0, result.name.length - 1);		
		/*根据城市名获得坐标*/
		that.geocoder.getPoint(that.cityname,function(position){
			that.position=position;
			that.getInfoByCity();
		})
	});
}
/*创建请求城市的连接*/
Weather.prototype.createUrl = function() {
	if(!this.cityname){return}
	var data = {
		today: "http://api.k780.com/?app=weather.today&weaid=" + this.cityname + "&appkey=30419&sign=6f493df0e48cd36390c4fa7a6dbd3a99&format=json&jsoncallback=weather.getTodayWeather",
		future: "http://api.k780.com/?app=weather.future&weaid=" + this.cityname + "&appkey=30419&sign=6f493df0e48cd36390c4fa7a6dbd3a99&format=json&jsoncallback=weather.getFutureWeather",
		aqi: "http://api.k780.com/?app=weather.pm25&weaid=" + this.cityname + "&appkey=30419&sign=6f493df0e48cd36390c4fa7a6dbd3a99&format=json&jsoncallback=weather.getAqi",
		lifeindex:"http://api.k780.com/?app=weather.lifeindex&weaid=" + this.cityname + "&appkey=30419&sign=6f493df0e48cd36390c4fa7a6dbd3a99&format=json&jsoncallback=weather.getLifeIndex",
		//lifeindex:"https://free-api.heweather.com/s6/weather/lifestyle?location=" + this.cityname + "&key=bf6ce2452c6246ffb0bb5f769c519c83&cb=weather.getLifeIndex",
		whistory:"https://api.caiyunapp.com/v2/A29NiwO5Y3qVbUNS/"+this.position.lng+","+this.position.lat+"/forecast.jsonp?callback=weather.getNext48Hours",
		//116.30+","+40.05 this.position.lng this.position.lat //如后退返回到第一个城市可能由于hash后面没有city导致无法获得position信息,需要在hash中判断并且再次调用getCity 进行定位
	}
	return data;
}

/*根据city获得数据*/
Weather.prototype.getInfoByCity=function(){
	/*清空原先数据*/
	$('div.today').html('');
	$('div.future').html('');
	$('ul.lifeDays').html('');
	$('div.lifeDatas').html('');
	$('ul.next48title').html('');
	
	this.data=this.createUrl();
	this.jsonp(this.data.today);
	this.jsonp(this.data.future);
	this.jsonp(this.data.aqi);
	this.jsonp(this.data.lifeindex);
	this.jsonp(this.data.whistory);
	
	
}


/*今日天气*/
Weather.prototype.getTodayWeather = function(data) {
	this.today = [];
	this.today.push(data.result);
	$('div.today').prepend(this.template2HTML('today'));
	
}
/*aqi指数*/
Weather.prototype.getAqi = function(data) {
	this.aqi = [];
	this.aqi.push(data.result);
	$('div.today').append(this.template2HTML('aqi'));
	console.log($('div.today .row:last'));
	
}
/*未来天气*/
Weather.prototype.getFutureWeather = function(data) {
	this.future = [];
	this.future = data.result;
	this.future.shift();
	$('div.future').append(this.template2HTML('future'))
}
/*生活指数*/
Weather.prototype.getLifeIndex = function(data) {
	console.log(data);
	this.lifeDays=[];
	this.lifeDatas=[];
	for(var i in data.result){
		data.result[i].days=data.result[i].days.substr(5);
		this.lifeDays.push({days:data.result[i].days,week_1:data.result[i].week_1});
		this.lifeDatas.push(data.result[i]);
	}
	
	//默认第一个nav需要选中
	$('ul.lifeDays').append(this.template2HTML('lifeDays'))
	$('div.lifeDatas').append(this.template2HTML('lifeDatas'))
	$("ul.lifeDays :first a").click();
}

/*未来48小时天气*/
Weather.prototype.getNext48Hours=function(data){
	/*aqi humidity pm2.5 precipitation temperature*/
	
	var titles={temperature:"气温",aqi:"aqi",humidity:"湿度",pm25:"pm2.5",precipitation:"降雨量"}
	console.log(data)
	this.next48title=[];
	this.next48content=[];
	for(var i=0;i<Object.keys(data.result.hourly).length;i++){
		if(Object.keys(data.result.hourly)[i] in titles){
			this.next48title.push({"title":Object.keys(data.result.hourly)[i],"value":titles[Object.keys(data.result.hourly)[i]]});
			this.next48content.push({"title":Object.keys(data.result.hourly)[i]});
		}
	}
	$('ul.next48title').append(this.template2HTML('next48title'))
	$('div.data48options').append(this.template2HTML('next48content'))
	this.data2EChart(titles,data.result.hourly);
	$('ul.next48title').prepend($("ul.next48title li:last"));
	$("ul.next48title li:first a").click();
	console.log(this.next48content)
}


/*数据转成图表对象*/
Weather.prototype.data2EChart=function(titles,data){
	console.log(titles);
	var data48hour={};
	var data48options=[];
	var myCharts={};
	var myChart={};
	for(var i in data){
		if(i in titles){
			data48hour[i]={value:[],datetime:[]};
			for(var k=0;k<24;k++){
				data48hour[i].value.push(data[i][k].value);
				data48hour[i].datetime.push(data[i][k].datetime);
			}
		}
	}
	
	this.ceil(data48hour);	
	myChart.myunit={
		aqi:"空气污染指数",
		humidity:"百分比%",
		pm25:"ug/m3",
		precipitation:"毫米",
		temperature:"℃",
	};
	for(var i in data48hour){
		//左上角标题
		myChart.title={
			//text:i
		};
		//中上标题
		myChart.legend={
			show:true,
			orient:'horizontal',
			itemHeight:15,
			itemWidth:15,
			formatter:function(name){
				return myChart.myunit[name];
			},
			data:[{
				name:i,
				textStyle: {
					color:"#337AB7",
			    }
			}],
		};
		myChart.grid={x:60,y:50,x2:60,y2:40};
		myChart.yAxis={
			axisPointer:{
				show:false,
				type:"shadow",
			},
			
			
		};
		myChart.xAxis={
			data: data48hour[i].datetime,
			axisLabel:{
				//X轴文字格式,字体大小
				interval:0,
				fontSize:10,
				formatter: function (value, index) {
					return value.substr(-5,2)+"时";
				}
			},
			axisPointer:{
				show:true,
				type:"shadow",
			},
			axisLine:{
				onZero:false,//X轴不固定在0上
			},
			axisTick:{
				alignWithLabel:true//刻度线和标签对齐
			}
		}
	

		
		myChart.tooltip={
			trigger: 'axis',
			formatter: function (params, ticket, callback) {  
				// console.log(params["seriesName"])
					var value=(params[0].seriesName=='precipitation')?params[0].value.toFixed(2):Math.floor(params[0].value);
					var time=params[0].dataIndex;
					var name=titles[params[0]["seriesName"]]
				return  time+" 时<br/>"+name+" : "+value;
			},	
		},
		myChart.series=[
			{
				name: i,
				type: "line",
				data: data48hour[i].value,
				symbol: "circle",
				symbolSize:5,
				smooth:true,
				label:{
					normal:{
						show:true,
						position:'top',
						formatter: function(params ){
							params.value=(params.seriesName=='precipitation')?params.value.toFixed(2):Math.floor(params.value);
							return params.value;
						},
					}
				},
				itemStyle:{
					normal:{
						color:"#3399CC",
					}
				}
			}
		];
		data48options.push(myChart)
		$("#"+i).css( 'width', $(".data48options").width() );
		myCharts[i] = echarts.init(document.getElementById(i));
		myCharts[i].setOption(data48options.shift());
		
		
	}
	window.onresize = function () {	
		/*只改变active状态的 echarts宽度*/
		$('.data48options .active').css( 'width', $(".data48options").width());
		myCharts[$('.data48options .active').attr('id')].resize();
	};	
	$(".next48title li a").on('click',function(e){
		var myid=$(e.currentTarget).attr("href").replace("#","");
		console.log($(e.currentTarget).attr("href").replace("#",""));
		console.log($($(e.currentTarget).attr("href")))
		//$('.data48options .active').css( 'width', $(".data48options").width());
		//myCharts[$('.data48options .active').attr('id')].resize();
		$("#"+myid).css( 'width', $(".data48options").width());
		myCharts[myid].resize();
	})
		
}

/*模板填充数据输出HTML*/
Weather.prototype.template2HTML = function(template) {
	var html = '';
	this[template].forEach(function(item) {
		html += $("template."+template).html().replace(/%\w+%/gi, function(old_value) {
			return item[old_value.replace(/%/gi, '')];
		})
	})
	return html;
}



/*hashchagne触发*/
Weather.prototype.hashChange = function(hash) {
	//hash没有cityname 
	if(!hash){
		hash="上海";
	}
	var that=this;
	this.future = [];
	this.today= [];
	this.cityname=decodeURI((hash?hash.replace('#', ''):null));
	this.geocoder.getPoint(that.cityname,function(position){
		that.position=position;
		that.getInfoByCity();
	})
}
/*提交事件*/
Weather.prototype.submit = function() {
	var url, val, e;
	if (arguments.length) {
		val = arguments[1];
		e = arguments[0];
		if (e.keyCode == 40 || e.keyCode == 38) {
			return false;
		}
		//如果input内是中文并且按下了回车
		if (e.keyCode == 13 && new RegExp("[\\u4E00-\\u9FFF]+", "g").test(val)) {
			url = location.href.split('#')[0] ? location.href.split('#')[0] : location.href;
			location.href = url + "#" + val;
		}
	} else {
		val = $("#name").val();
		url = location.href.split('#')[0] ? location.href.split('#')[0] : location.href;
		location.href = url + "#" + val;
	}
}
/*获得当前日期时间YYYY-MM-DD*/
Weather.prototype.getDateStr=function(){
	var d=new Date();
	var year=d.getFullYear();
	var month=(d.getMonth()==12?1:d.getMonth()+1);
	var day=d.getDate();
	return year+"-"+month+"-"+day;
}

/*对数值取整方便显示*/
Weather.prototype.ceil=function(data48hour){
	data48hour.humidity.value=data48hour.humidity.value.map(function(currentValue, index,arr){
		return currentValue*100;
	})
	data48hour.precipitation.value=data48hour.precipitation.value.map(function(currentValue, index,arr){
		return currentValue*10;
	})
		console.log(data48hour);
}
