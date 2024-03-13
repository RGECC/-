// pages/wode/wode.js
//↓全局定义一个默认的头像链接，这里我上传到云数据库的默认头像链接
//https的链接不会被覆盖缓存
const defaultAvatarUrl = 'https://6469-diancan-9ggfzy3w82b5a9ea-1323833298.tcb.qcloud.la/kit-cms-upload/2024-01-20/16701705759612064_默认头像.png?sign=24d08a229e3310de5d5a6423b68a817f&t=1705774148'
Page({
  //将islogin的值设置为false以用来作为失效的初始量
  islogin:false,
  data: {
    avatarUrl: defaultAvatarUrl
  },
  onChooseAvatar(e) {       //设定一个e来作为介质存储获取到的用户头像的url地址
    const { avatarUrl } = e.detail
    console.log('用户头像',avatarUrl)
    this.setData({
      avatarUrl,             //avatarUrl: 将页面数据中的 avatarUrl 属性更新为用户选择的头像URL，这样页面就能显示用户选择的头像。
      islogin:true,         
    })
    wx.setStorageSync('avatarUrl', avatarUrl) //存入本地缓存
  },
  onLoad(){
    let touxiang=wx.getStorageSync('avatarUrl')    //当用户在已登录的状态下进入我的页面时拉取存在本地的用户头像
    console.log('进入登录页面获取用户头像缓存',touxiang)
    if (touxiang) {
      this.setData({      //获取本地缓存的用户头像并将islogin的值改为true
        avatarUrl: touxiang,
        islogin: true,
      })
    }
  },
  loginout(){             //当用户点击退出登录时所要执行的操作
    this.setData({
      avatarUrl: defaultAvatarUrl,         //将获取头像的url设定为默认头像的链接并将islogin改成false
      islogin:false,
    })
    wx.setStorageSync('avatarUrl', null)            //将本地缓存清除覆盖为null
  },
  //点击跳转到拨打电话号码
  call(){
    wx.makePhoneCall({
      phoneNumber: '123456789',
    })
  },
  xinxi(){
    wx.navigateTo({
      url: '/pages/myxinxi/myxinxi',
    })
  },
  dingdan(){
    wx.navigateTo({
      url: '/pages/myorder/myorder',
    })
  },
  pingjia(){
    wx.navigateTo({
      url: '/pages/pingjia/pingjia',
    })
  },
  goadmin(){
    wx.navigateTo({
      url: '/pages/admin/admin',
    })
  }
})