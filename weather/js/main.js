require.config({
    paths : {
        "jquery" : ["lib/jquery/dist/jquery"],
        "bootstrap":["lib/bootstrap/dist/js/bootstrap"],
        "weather":["weather/weather"],
        "py":["weather/py"],
        "sidebar":["weather/sidebar"],
        "icon":["../icon/iconfont"],
        "youziku":["https://cdn.webfont.youziku.com/wwwroot/js/wf/youziku.api.min"],
		"echarts":["lib/echarts/echarts"],
    },
    shim:{
    	"bootstrap":{
    		deps:["jquery"]
    	},
    	"weather":{
    		deps:["jquery","bootstrap"]
    	},
    	"sidebar":{
    		deps:["weather","icon"]
    	},
	
    },
})
require(["jquery","echarts","sidebar"],function($,echarts){

	$(function(){
		window.echarts=echarts;
		window.weather = new Weather();	
		weather.init();	


	})

})