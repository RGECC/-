// pages/order/order.js
const app=getApp()
Page({
  data:{
    zhuohaonum:null,   //桌号默认为空
    people:0,    //用餐人数默认为0
    peoplelist:[1,2,3,4],   //设置就餐人数数组
    paylist:['微信支付'],   //选择的支付方式
    ishiddenmengceng:true, //进入页面的时候支付蒙层默认关闭显示
  },
  onShow(){
    console.log('全局存的桌号：',app.globalData.zhuohao)
    let list = wx.getStorageSync('cart')||[]   //如果本地缓存为空则赋值空数组给list，否则直接赋值已有的本地缓存给list
    console.log("本地缓存的list",list)      
    this.setData({      //将修改好的数据写进list
      list,
      zhuohaonum:app.globalData.zhuohao
    })
    this.getTotal()
  },
      // 计算总价格和总数量
      getTotal() {
        let list = this.data.list
        let totalprince = 0
        let totalnum = 0
    
        list.forEach(item => {
          totalnum += item.num
          totalprince += item.num * item.prince       //总价格计算，总数乘以单个的价格
        })
        this.setData({
          totalprince,
          totalnum
        })
      },
      //扫码识别桌号
      saoma(){
        let that=this  //that指向this
        wx.scanCode({   //调取使用微信扫一扫功能识别桌号
          success(res){
            console.log(res.result)
            app.globalData.zhuohao=res.result     //将扫码获取到的桌号存到globalData全局数据里，以便下次进来不用再次扫码
            that.setData({
              zhuohaonum:res.result
            })
          }
        })
      },
      //选中就餐人数
      dianji(a){   //当我们需要从wxml往js存值的时候就需要这个a
        console.log(a.currentTarget.dataset.item)
        this.setData({
          people:a.currentTarget.dataset.item   //将点击的图片的数字写入到people数组中以展示到页面上去
        })
      },
      //获取用户输入的备注
      get_beizhu(a){
        this.setData({
          beizhu:a.detail.value
        })
      },
      //提交订单
      tijiao(){
        //如果用户还没有登录则跳转到登录页面
        let avatarUrl=wx.getStorageSync('avatarUrl')        //从缓存里获取到用户的头像
        if(!avatarUrl){
          wx.showToast({
            icon:'none',
            title: '您还没有登录！点击头像图标进行登录'
          })
          setTimeout(()=>{            //如果没有登录则跳出提示并延迟2000毫秒跳转到我的页面处登录
            wx.switchTab({
              url: '/pages/wode/wode',
            })
          },3000);                //设置2000毫秒跳转等待时间
        }else{

          console.log('执行了提交订单')
          let nicheng=wx.getStorageSync('nicheng')        //从缓存里获取到用户的昵称
          let dianhua=wx.getStorageSync('dianhua')        //从缓存里获取到用户的电话号码
          console.log('用户的名字',nicheng)
          console.log('用户的电话',dianhua)
          //检查用户是否填写了昵称和电话号码
          if(!nicheng&&!dianhua){
            wx.showToast({
              icon:'none',
              title: '您还没填写昵称或电话号码，请去我的页面‘编辑我的详细信息’处编写并保存'
            })
            setTimeout(()=>{            //如果没有填写则弹出提示框并与2000毫秒后跳转到编辑详细信息页填写昵称和电话号码
              wx.navigateTo({
                url: '/pages/myxinxi/myxinxi',
              })
            },2000);                //设置2000毫秒跳转等待时间
            return
          }
          //提交订单
          wx.cloud.database().collection('dingdan')
            .add({
              data:{
                name:nicheng,//用户的昵称
                call:dianhua,//用户的电话
                zhuangtai:0,//订单的状态：-1订单取消，0新下单未上菜，1已上餐待评价，2订单已完成
                zhuohao:this.data.zhuohaonum,//桌号
                beizhu:this.data.beizhu,//用户写的备注
                renshu:this.data.people,//用餐人数
                orderlist:this.data.list,//用户购买的菜品
                totalprince:this.data.totalprince,//订单的总价
                time:this.getCurrentTime() //用户下单时间
              }
            }).then(res=>{

              //增加销量操作
              let foods=[]
              this.data.list.forEach(item=>{          //遍历用户选的菜品
                let food={}               //建立一个新的对象
                food._id=item._id         //遍历用户选的菜品的id和选择数量赋值给food对象中的id和num里，除这两个外别的都做过滤清除掉
                food.num=item.num
                foods.push(food)
              })
              //调用云函数添加销量操作
              wx.cloud.callFunction({
                name:'addxiaoliang',        //云函数名称
                data:{
                  foods:foods         
                }
              }).then(res=>{
                console.log('云函数的返回',res)
              })
              


              console.log('提交成功',res)
              //提交成功后则将购物车清空
              wx.setStorageSync('cart', null)
              wx.setStorageSync('clearCart', true);   //提交成功后将缓存里清除购物车的操作改为true以执行清除点餐页的购物车操作
              wx.showToast({
                title: '成功下单！',
              })
              setTimeout(()=>{            //提交订单成功后延迟两秒跳转到我的订单页面
                wx.navigateTo({
                  url: '/pages/myorder/myorder',
                })
              },2000);                //设置2000毫秒跳转等待时间
              return
            }).catch(res=>{
              console.log('提交订单失败',res)
            })
        }
      
    },
      // 获取当前时间
  getCurrentTime() {
    let d = new Date();
    let month = d.getMonth() + 1;
    let date = d.getDate();
    let hours = d.getHours();
    let minutes = d.getMinutes();
    let curDateTime = d.getFullYear() + '年';
    if (month > 9)
      curDateTime += month + '月';
    else
      curDateTime += month + '月';
    if (date > 9)
      curDateTime = curDateTime + date + "日";
    else
      curDateTime = curDateTime + date + "日";
    if (hours > 9)
      curDateTime = curDateTime + hours + "时";
    else
      curDateTime = curDateTime + hours + "时";
    if (minutes > 9)
      curDateTime = curDateTime + minutes + "分";
    else
      curDateTime = curDateTime + minutes + "分";
    return curDateTime;
  },
    //打开购物车展开的蒙层
    openmengceng(){
      if(!this.data.zhuohaonum){            //如果点击提交订单时桌号数组为空的话则弹出提示'请扫码识别桌号'
      wx.showToast({
        icon:'error',
        title: '请扫码识别桌号',
      })
    }else if(!this.data.people){      //如果点击提交订单时用餐人数为空的话则弹出提示'请选择用餐人数'
      wx.showToast({
        icon:'error',
        title: '请选择用餐人数',
      })
    }else{
            this.setData({
        ishiddenmengceng:false
      })
    }

    },
  //关闭购物车展开的蒙层
  closemengceng(){
    this.setData({
      ishiddenmengceng:true
    })
  },
})