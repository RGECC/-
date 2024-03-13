// pages/pingjia/pingjia.js
Page({
  data:{
    tabs:['全部评价','我的评价'],
    currenttap:1,        //把选择的tap键数默认为0。0到3依次为'待上菜','待评价','已完成','已取消'
  },
  onLoad(){
    this.getlist(1)
  },
    //实现选中顶部tap栏切换
    selecttap(a){
      let index=a.currentTarget.dataset.index       //拿到每个tap的index值，从左到右分别为0,1,
      console.log("用户点击了",index)
      this.setData({
        currenttap:index            //将每个tap的值赋给currenttap
      })
      this.getlist(index)     //每次点击tap栏的一个格子则把该格子的index值传给getlist方法的zhuangtai值
    },
    //获取评价数据
    getlist(index){
      //index 0为全部评价，1为我的评价
      if(index==1){
        //小程序端调用数据库权限比使用云函数调用数据库低

        wx.cloud.database().collection('pinglun').get()  //如果页面index数为1时则从云数据库中获取pinglun数据库中的数据
        .then(res=>{
          console.log('我的评价',res)         //查看我的评价的时候只能查看和查看者一样的openid的评论
          this.setData({
            list: res.data // 更新页面的 list 数据，只获取自己的评论
          })
        })
      }else{
        //使用云函数来调用数据库来查看全部评价可以用最高权限看到全部评论不论是谁评论的都可以看到

        wx.cloud.callFunction({         //调用云函数getpinglun
          name:'getpinglun'
        }).then(res=>{
          console.log('全部评价列表',res)
          this.setData({
            list:res.result.data            //更新全部列表包括别人的评论
          })
        })
      }
    }
})