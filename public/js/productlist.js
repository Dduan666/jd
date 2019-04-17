//1:第一个模块功能 用户登录
//2:查找登录按钮绑定点击事件
$("#bt-login").click(function(){
//3:获取用户名和密码
    var u = $("#uname").val();
    var p = $("#upwd").val();
//4:发送ajax port /user_login
    $.ajax({
        type:"POST",
        url:"/user_login",
        data:{uname:u,upwd:p},
        success:function(data){
            if(data.code>0){
                console.log("登录成功");
                //隐藏模态框
                $(".modal").hide();
                //保存uname uid cookie
                //document.cookie='uname='+u;
                //document.cookie='uid='+data.uid;
                sessionStorage.setItem("uname",u);
                sessionStorage.setItem("uid",data.uid);
            }else{
                //修改提示信息 “用户名或密码错误”
                $("p.alert").html(data.msg);
            }
        },
        error:function(){
            alert("网络出错故障，请重试");
        }
    });
//5:并且接收返回结果 json
});



//所有分页内容保存在函数loadProduct中
//当前内容的显示
function loadProduct(pageNo) {
    //页码的显示    [1][2][3][4][5]
    //1:发送一个ajax请求 /productlist 获取当前页内容
    $.ajax({
        type:"GET",
        url:"/productlist",
        data:{pageNo:pageNo},
        success:function(data){
            console.log(data);
            //2:获取返回的数据
            //3:拼接字符串
            var html = "";
            for(var i=0;i<data.length;i++) {
                var o = data[i]; //15:43--15:53
                html += `
<li>
  <a href="">
  <img src="${o.pic}" alt=""/></a>
  <p>${o.price}</p>
  <h1><a href="">${o.pname}</a></h1>
  <div>
      <a href="" class="contrast"><i></i>对比</a>
      <a href="" class="p-operate"><i></i>关注</a>
      <a href="${o.pid}" class="addcart"><i></i>加入购物车</a>
  </div>
</li>
       `;
            }
            //4:保存页面中
            $("#plist ul").html(html);

        }
    });

    //5:再次发送ajax请求 /productpage 总页数
    $.ajax({
        type:"GET",
        url:"/productpage",
        success:function(data){
            //1:总页数
            var p = data.page;
            //2:拼接页码
            var html = "";
            for(var i=1;i<=p;i++){
                html += `
         <li><a href="#">${i}</a></li>
       `;
            }
            //3:保存
            $("ol.pager").html(html);
        }
    });
    //6:获取返回的数据总页数
    //7:循环创建页码

    //完成下列功能
    //功能一:当前页码 高亮 加class active
    //功能二:绑定点击事件页码 [1][2][3][4][5]
}
loadProduct(1);
//功能点3：为每个商品下面"添加购物车"绑定监听事件
$("#plist").on("click","a.addcart",function(e){
    //1:阻止事件默认行为
    e.preventDefault();
    //2:发送ajax请求 uid pid
    var uid = sessionStorage.getItem("uid");
    var pid = $(this).attr("href");
    $.ajax({
        type:"GET",
        url:"/addcart",
        data:{pid:pid,uid:uid},
        success:function(data){
            if(data.code>0){
                alert("添加成功"+data.msg);
            }
        }
    });
});


$(function(){
    $("#header").load("header.html");
    $("#footer").load("footer.html");
});

//点击去购物车查询按钮
$(document.body).on("click","#settel_up",function(){
    location.href="shoppingcart.html";
});
