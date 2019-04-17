//项目入口文件
//1：加载相应模块 http/express/qs/mysql
const http = require("http");
const express = require("express");
const qs = require("querystring");
const mysql = require("mysql");
//#检查模块安装成功
//2: 创建连接池 25
var pool = mysql.createPool({
    host:"127.0.0.1",
    user:"root",
    password:"",
    database:"jd",
    port:3306,
    connectionLimit:25    //3000 VP/1 day
});
//3: 创建服务器并且监听端口 8081
var app = express();
var server = http.createServer(app);
server.listen(8081);

//4:使用nodejs中间件向客户端直接返回静态内容
//public
app.use(express.static("public"));


//功能模块一:用户登录
app.post("/user_login",(req,res)=>{
    //1:为request对象绑定事件 data
    req.on("data",(data)=>{
        //2:获取用户参数:用户名和密码
        var str = data.toString();
        var obj = qs.parse(str);
        var u = obj.uname;
        var p = obj.upwd;
        //3:从连接池中获取连接
        pool.getConnection((err,conn)=>{
            //4:创建SQL语句并且发送SQL
            var sql = "SELECT * FROM jd_user";
            sql += " WHERE uname=? AND upwd=?";
            conn.query(sql,[u,p],(err,result)=>{
                if(err)throw err;
                //5:判断查询结果是否正确
                if(result.length<1){
                    res.json({code:-1,msg:"用户名和密码有误"});
                }else{
                    res.json({code:1,msg:"登录成功",uid:result[0].uid});
                }
                conn.release();
                //6:正确:res.json()
                //  var obj = {code:1,msg:"登录成功"}
                //  res.json(obj);
                //7:错误:res.json()
            });
        });//conn end
    });
});


//功能模块二:产品分页查询
//2.1:当前页内容
app.get("/productlist",(req,res)=>{
    //console.log(req.query);
    //1：获取参数pageNo 当前页 1 2 3 4 ..
    var pageNo = req.query.pageNo;
    //1.1:目标错误输入没有参数?pageNo=1
    if(pageNo==null){pageNo=1;}
    //2: 计算公式查询偏移动  LIMIT ?,8
    var offset = (pageNo-1)*8;
    //3: 获取数据库连接
    pool.getConnection((err,conn)=>{
        //4: var sql = "SELECT * FROM jd_product LIMIT ?,?";
        var sql = "SELECT * FROM jd_product"
        sql += " LIMIT ?,?";
        //5: 查询并且将结果按json发送
        conn.query(sql,[offset,8],(err,result)=>{
            if(err)throw err;
            res.json(result);
            conn.release();
        });
    });
})
//2.2:总页数
app.get("/productpage",(req,res)=>{
    //1:获取数据库连接
    pool.getConnection((err,conn)=>{
        //2:创建SQL SELECT count(*) FROM jd_product;
        var sql = "SELECT count(*) as c FROM jd_product";
        //总记录 36
        conn.query(sql,(err,result)=>{
            var p = (Math.ceil(result[0].c/8));
            conn.release();
            res.json({page:p});
        });
        //3:计算公式  向上取整 36/8 Math.ceil()
        //4:发送json
    });
})


//功能模块三:将某个商品添加至购物车
app.get("/addcart",(req,res)=>{
    var pid = req.query.pid;
    var uid = req.query.uid;
    //17:00--17:20
    pool.getConnection((err,conn)=>{
        //1:根据用户编号和产品编号查询购物编码
        var sql = "SELECT * FROM jd_cart";
        sql += " WHERE uid=? AND pid=?";
        //2:查询没有结果
        conn.query(sql,[uid,pid],(err,result)=>{
            if(err)throw err;
            if(result.length<1){
                var sql = "INSERT INTO jd_cart";
                sql+=" VALUES(null,?,?,1)";
                conn.query(sql,[pid,uid],(err,result)=>{
                    res.json({code:1,msg:"添加成功数量1"});
                    conn.release();
                })
            }else{
                var c = parseInt(result[0].count)+1;
                var sql = "UPDATE jd_cart";
                sql+=" SET count=count+1";
                sql+=" WHERE uid=? AND pid=?";
                conn.query(sql,[uid,pid],(err,result)=>{
                    res.json({code:1,msg:"添加成功"+c});
                    conn.release();
                });
            }
        });//17:00--17:20
        //3:添加一条记录
        //4:查询有结果
        //5:更新记录数量
    });
});



//###################
//新添加功能四:查看购物车信息
//表:jd_product        jd_cart
//   pname pic price   cid count uid
//1:FROM jd_product,jd_cart
//2:FROM jd_product p,jd_cart c
//3:WHERE p.pid= c.pid
//SELECT c.cid, p.pname, p.price,
//    p.pic, c.count
//FROM jd_product p,jd_cart c
//WHERE p.pid= c.pid AND c.uid = ?
//9:30--9:40
//1:get /getcart 参数 uid
app.get("/getcart",(req,res)=>{
    //2:获取用户传递参数  uid
    var uid = req.query.uid;
    //3:获取数据库连接
    pool.getConnection((err,conn)=>{
        //4:创建SQL语句并且并发SQL
        var sql = " SELECT c.cid, p.pname, p.price,";
        sql +=" p.pic, c.count";
        sql +=" FROM jd_product p,jd_cart c";
        sql +=" WHERE p.pid= c.pid AND c.uid = ?";

        conn.query(sql,[uid],(err,result)=>{
            if(err)throw err;
            //5:将查询结果发送json
            res.json(result);
            //6:归还数据库连接
            conn.release();
        });

    });
});

//新添加功能五:删除购物车中的信息
//10:45--11:00
//1:get /delcart
app.get("/delcart",(req,res)=>{
    //2:获取用户提交参数 cid
    var cid = req.query.cid;
    //3:获取连接
    //4:创建SQL语句并且并发送SQL
    pool.getConnection((err,conn)=>{
        var sql = "DELETE FROM jd_cart WHERE cid=?";
        conn.query(sql,[cid],(err,result)=>{
            if(err)throw err;
            //5:获取服务器返回
            //{code:1,msg:"删除成功"}
            //{code:-1,msg:"删除失败"}
            if(result.affectedRows>0){
                res.json({code:1,msg:"删除成功"});
            }else{
                res.json({code:-1,msg:"删除失败"});
            }
            conn.release();
        });
    });

});



//新添加功能六:减去当前购物车记录数量 -
//11:40--11:50
//1:get /cart_update_sub
app.get("/cart_update_sub",(req,res)=>{
    //2:获取购物项 cid
    var cid = req.query.cid;
    //3:获取数据库连接
    //4:创建SQL语句并且发送SQL
    pool.getConnection((err,conn)=>{
        var sql = " UPDATE jd_cart SET count=count-1";
        sql += " WHERE cid = ?";
        conn.query(sql,[cid],(err,result)=>{
            //5:获取返回结果
            if(result.affectedRows>0){
                res.json({code:1,msg:"更新成功"});
            }else{
                res.json({code:-1,msg:"更新失败"});
            }
            //6:关闭连接
            conn.release();
        });
    });
});
//新添加功能七:当前购物车记录数量 +
app.get("/cart_update_add",(req,res)=>{
    //2:获取购物项 cid
    var cid = req.query.cid;
    //3:获取数据库连接
    //4:创建SQL语句并且发送SQL
    pool.getConnection((err,conn)=>{
        var sql = " UPDATE jd_cart SET count=count+1";
        sql += " WHERE cid = ?";
        conn.query(sql,[cid],(err,result)=>{
            //5:获取返回结果
            if(result.affectedRows>0){
                res.json({code:1,msg:"更新成功"});
            }else{
                res.json({code:-1,msg:"更新失败"});
            }
            //6:关闭连接
            conn.release();
        });

    });

});




