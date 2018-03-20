
/*定义左侧边栏类*/
function Sidebar(){
	this.$form;
	this.$ipt;
	this.list;
	this.isvisible=false;
	this.$current;
}



Sidebar.prototype.init=function(weather){
	this.register(weather);
}

Sidebar.prototype.register=function(weather){
	var that=this;

	/*input注册onkeyup*/
	$("#name").on("keyup",function(e){
		//根据输入获得列表
		that.list=weather.city[this.value]?weather.city[this.value]:'';
		//通过列表显示ul
		that.createList(that.list,e.keyCode);
		
		//如列表存在 则判断输入的上下回车按键
		if(that.list){
			if(e.keyCode==40){
				if(!that.$current.parent().next().length)return;
				that.$current.parent().next().children('a').addClass('current');
				that.$current.removeClass('current');
				that.$current=that.$current.parent().next().children('a');
			}
			if(e.keyCode==38){
				if(!that.$current.parent().prev().length)return;
				that.$current.parent().prev().children('a').addClass('current');
				that.$current.removeClass('current');
				that.$current=that.$current.parent().prev().children('a');
			}
			if(e.keyCode==13){
				$(this).val(that.$current.text());
				that.$current='';
				that.createList('');
			}
		}
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


/*创建citylist的列表显示*/
Sidebar.prototype.createList=function(list,keyCode){
	if(keyCode==40 || keyCode==38 || keyCode==13)return ;
	
	//先清空列表
	$("#cityform .dropdown-menu").first().empty();

	for(var i=0,len=list.length;i<len;i++){
		//查出首拼城市添加到li内显示出来
		$("#cityform .dropdown-menu").append("<li class='list-city'><a href='#'>"+list[i]+"</a></li>");
	}

	//显示ul
	$("#cityform .dropdown-menu").css('display','block');
	//滚动条位置最上方
	$("#cityform .dropdown-menu").scrollTop(0);
	//根据list长度判断是否隐藏显示 
	$("#cityform .dropdown-menu").css('visibility',list.length?'visible':'hidden');
	//给默认第一个li添加hover样式 默认选中第一个li
	$("#cityform .ovs .list-city:first a").addClass('current');
	//将当前显示的list保存起来
	this.$current=$("#cityform .ovs .list-city:first ").find(".current")

	


}



