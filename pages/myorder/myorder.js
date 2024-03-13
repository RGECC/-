// pages/myorder/myorder.js
Page({
  data:{
    tabs:['待上菜','待评价','已完成','已取消'],
    currenttap:0,        //把选择的tap键数默认为0。0到3依次为'待上菜','待评价','已完成','已取消'
  },
  //实现选中顶部tap栏切换
  selecttap(a){
    let index=a.currentTarget.dataset.index       //拿到每个tap的index值，从左到右分别为0,1,2,3
    console.log("用户点击了",index)
    this.setData({
      currenttap:index            //将每个tap的值赋给currenttap
    })
    if(index==3){       //判断如果index值为3，就给index赋值-1
      index = -1
    }
    wx.cloud.database().collection('dingdan')   //获取订单数据
    .where({            //搜索与当前点击页面相同的index数在订单状态里相匹配的数
      zhuangtai:index    //订单的状态：-1订单取消，0新下单未上菜，1已上餐待评价，2订单已完成
    })
    .get()
    .then(res=>{
      console.log('请求订单列表成功',res)
      this.setData({
        list:res.data           //将请求过来的订单列表写入到list中
      })
    })
    .catch(res=>{
      console.log('失败',res)
    })
    this.getlist(index)     //每次点击tap栏的一个格子则把该格子的index值传给getlist方法的zhuangtai值
  },
  onLoad(){
    this.getlist(0)       //初次进入该页面则默认为0的值给zhuangtai
  },
  //获取提交订单的菜品数据
  getlist(zhuangtai){
    wx.cloud.database().collection('dingdan')
    .where({
      zhuangtai:zhuangtai       //订单的状态：-1订单取消，0新下单未上菜，1已上餐待评价，2订单已完成
    })
    .get()
    .then(res=>{
      console.log('请求订单列表成功',res)
      this.setData({
        list: res.data          //将从数据库中获取的订单列表数据 res.data 更新到页面的 list 变量中
      })
    })
    .catch(res=>{
      console.log('失败',res)
    })
  },
  //取消订单
  quxiaodingdan(e){
    let id=e.currentTarget.dataset.id    //用户点击完获取到订单号
    console.log(e.currentTarget.dataset.id)
    wx.cloud.database().collection('dingdan').doc(id)   //修改数据库订单
    .update({
      data:{
        //订单的状态：-1订单取消，0新下单未上菜，1已上餐待评价，2订单已完成
        zhuangtai:-1
      }
    }).then(res=>{
      console.log('取消订单的结果',res)
      this.getlist(0)                   //取消订单时将跳转到待上菜的tag处重新请求一遍该新下单未上菜的列表
    }).catch(res=>{
      console.log('取消订单失败',res)
    })
  },
//去评价
pingjia(e){
  let id=e.currentTarget.dataset.id    //用户点击完获取到订单号
  let nicheng=wx.getStorageSync('nicheng')      //从缓存中获取到昵称数据并赋值给nicheng这个变量
  console.log('用户信息',nicheng)
  wx.showModal({          //设置评论框，使用微信自带的showModal方法组件
    title: '请输入评价内容',
    editable:true,        //true把评论框显示出来以供用户输入评论
    cancelColor:'取消',
    content: '',
    complete: (res) => {
      if (res.cancel) {
      }
      if (res.confirm) {
        if (res.content) {                //判断输入的评论有没有

          console.log('用户的输入内容',res.content)
          wx.cloud.database().collection('pinglun').add({      //点击确定时将缓存中的昵称，和获取到的订单号和用户输入的内容都写入到云数据库中的pinglun数据库
            data:{
              name:nicheng,
              dingdanhao:id,
              neirong:res.content,
              time:this.getCurrentTime()
            }
          }).then(res=>{
            // 先更新订单状态为已完成
            wx.cloud.database().collection('dingdan').doc(id).update({
              data:{
                zhuangtai:2  //订单状态标记为已完成
              }
            }).then(() => {
              // 再重新获取待评价的订单列表
              this.getlist(1);
            }).catch(error => {
              console.error('更新订单状态失败', error);
            });

            wx.showToast({
              title: '评论成功！',
            })
          })   //获取订单数据

        }
        else{
          wx.showToast({
            icon:"error",
            title: '您还未输入评论',
          })
        }
      }
    }
  })
},
chakan(){                 //跳转到我的评价页面
  wx.navigateTo({
    url: '/pages/pingjia/pingjia',
  })
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
})