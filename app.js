// app.js
App({
  globalData:{
    zhuohao:null,      //存储用户扫码得到的桌号以便下次进入直接拿到桌号
  },
  onLaunch() {
    //↓初始化云开发，env使用云开发的环境id↓
    wx.cloud.init({
      env:'diancan-9ggfzy3w82b5a9ea'
    })
  },
  globalData: {
    userInfo: null
  }
})
