//1:新添加功能点三:动态加载页头与页尾
$(function(){
    $("#header").load("header.html");
    $("#footer").load("footer.html");
});

//2:新添加功能点四:异步请求当前登录用户购物车信息
//10:20--10:25
//1:发送AJAX请求
//2:/getcart get
$.ajax({
    type:"GET",
    url:"/getcart",
    data:{uid:sessionStorage["uid"]},
    success:function(data){
        //3:获取返回数据 data []
        var html = "";
        for(var i=0;i<data.length;i++){
            var o = data[i];
            //4:拼接字符串
            html += `
<tr>
<td>
<input type="checkbox" class="clist"/>
<input type="hidden" value="1" />
<div><img src="${o.pic}" alt=""/></div>
</td>
<td><a href="">${o.pname}</a></td>
<td>${o.price}</td>
<td>
<button class="${o.cid}">-</button>
<input type="text" value="${o.count}"/>
<button class="${o.cid}">+</button>
</td>
<td><span class="totallist">${o.price*o.count}</span></td>
<td><a href="${o.cid}" class="btn-del">删除</a></td>
</tr>

      `;
        }
        //5:保存 id="tb1"
        $("#tb1").html(html);
    }
})



//2:新添加功能点五:
//异步删除购物车中的信息 cid
$("#tb1").on("click","a.btn-del",
    function(e){
//1:阻止事件默认行为 11:20--11:25
        e.preventDefault();
// 2:获取当前删除记录cid
        var cid = $(this).attr("href");
//3:获取当前元素祖先元素  tr
//var tr = $(this).parent().parent();
        var tr = $(this).parents("tr");
//4:发送ajax请求 get  /delcart cid
        var rs = window.confirm("是否要删除该记录");
        if(rs===false){
            return;
        }
        $.ajax({
            url:"/delcart",
            data:{cid:cid},
            success:function(data){
                //5:获取返回结果code
                if(data.code>0) {
                    alert(data.msg);
                    tr.remove();
                    //6:如果删除成功  删除 tr
                }else{
                    alert(data.msg)
                }
            }
        });

    });

//3:新添加功能点六:
//购物车中按钮"-"绑定点击事件发送ajax
$("#tb1").on("click",
    "button:contains('-')",function(e){
//1:获取参数 cid
        var cid = $(this).attr("class");
//2:获取数量 count
        var inputCount = $(this).next();
//2.1 获取单价
        var inputPrice = $(this).parent().prev();
//2.2 获取小计
        var totalInput = $(this).parent().next();
//3:如果当前数量为 1   14:33--14:38
        if(inputCount.val()==1) {
            // 3.1 询问是否删除该记录
            // 3.2 如果用户点击 "是" 记录
            var tr = $(this).parent().parent();
            delCartFun(tr,cid);
            return;
        }
//4:发送ajax请求 get /cart_update_sub
        $.ajax({
            url:"/cart_update_sub",
            data:{cid:cid},
            success:function(data){
                //5:获取返回数据
                if(data.code>0){
                    alert(data.msg);
                    //6:修改  下一个兄弟 5->4
                    inputCount.val(inputCount.val()-1);
                    //7:重新计算小计    (获取单价*数量)
                    totalInput.html
                    ("<span>"+
                    (inputCount.val()*inputPrice.html())
                    +"</span>");
                }///14:20--14:25
            }
        });
    });




//完成删除一行操作
function delCartFun(tr,cid){
//4:发送ajax请求 get  /delcart cid
    var rs = window.confirm("是否要删除该记录");
    if(rs===false){
        return;
    }
    $.ajax({
        url:"/delcart",
        data:{cid:cid},
        success:function(data){
            //5:获取返回结果code
            if(data.code>0) {
                alert(data.msg);
                tr.remove();
                //6:如果删除成功  删除 tr
            }else{
                alert(data.msg)
            }
        }
    });
}

//功能点七:完成+操作 14:51--15:00
$("#tb1").on("click",
    "button:contains('+')",function(e){
        //1:获取当前记录cid
        var cid = $(this).attr("class");
        //2:获取输入框数量
        var inputCount =  $(this).prev();
        //3:获取单价
        var priceInput = $(this).parent().prev();
        //4:获取小计
        var totalInput = $(this).parent().next();
        //5:发送ajax请求, cart_update_add get  cid
        $.ajax({
            url:"/cart_update_add",
            data:{cid:cid},
            success:function(data){
                //6:获取返回数据
                //7:修改数量
                //8:修改小计
                if(data.code<1){
                    alert(data.msg);
                }else{
                    alert(data.msg);
                    var c = parseInt(inputCount.val())+1;
                    var p = priceInput.html();
                    var t = c*p;
                    //修改小计
                    totalInput.html("<span>"+t+"</span>");
                    //修改数量
                    inputCount.val(c);
                }
            }
        })

    });

//功能8:全选+小计=总价
//1.获取全写按钮
//2.绑定事件
//3.判断选中还取消选中
//4.将所有产品前复选框随着全选中
//5.计算总价：获取所有小计相加
$("#selAll").change(function(){
    //状态属性  prop();
    var  list=$("#tb1 input.clist");
   if($(this).prop("checked")){
   list.prop("checked",true);
       var tlist=$("#tb1 span.totallist")
       var sum=0;
       tlist.each(function(idx,obj){
           sum+=parseFloat(obj.innerHTML);
       });
       $("#total2").html(sum);
    } else{
       list.prop("checked",false);
   }
});