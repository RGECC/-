Page({
  data: {
    name: '',      // 初始化账号和密码为空
    password: '',
    nologin: true  // 默认为未登录状态
  },
  onLoad() {
    let admin = wx.getStorageSync('admin'); // 获取缓存中的登录信息
    console.log('缓存登录信息', admin);
    if (admin && admin.name && admin.password) {    
      // 如果缓存中有登录信息，则尝试自动登录
      this.logindata(admin.name, admin.password);
    }
  },
  getname(e) {          //将用户在页面输入的账号信息传到e里并存到name对象中去
    this.setData({
      name: e.detail.value
    });
  },
  getpassword(e) {        //将用户在页面输入的密码信息传到e里并存到password对象中去
    this.setData({
      password: e.detail.value
    });
  },
  gologin() {
    // 点击登录按钮时，先判断是否输入了账号和密码
    if (!this.data.name || !this.data.password) {
      wx.showToast({
        icon: 'error',
        title: '请输入账号和密码',
      });
      return;
    }
    // 输入了账号和密码，则尝试登录
    this.logindata(this.data.name, this.data.password);
  },
  logindata(name, password) {
    wx.cloud.database().collection("qitatupian")        //获取到云数据库存放管理员密码和账号的数据库，并找到name账号和code密码等字段
    .where({
      name: name,
      code: password
    }).get().then(res=>{                  //向云数据库请求对的账号和密码的数据
      console.log('返回的数据',res);
      if (res.data && res.data.length > 0) {
        // 登录成功
        this.setData({
          nologin: false
        });
        // 缓存账号密码以用于记录登录状态
        let admin = { name: name, password: password };
        wx.setStorageSync('admin', admin);
      } else {
        // 登录失败,则提示账号或密码错误
        wx.showToast({
          icon: 'error',
          title: '账号或密码错误',
        });
        wx.setStorageSync('admin', null)          //若登录失败则将缓存里存放账号密码的admin赋值为null清空数据
      }
    }).catch(res=>{
      console.log('请求失败',res);
    });
  },
  loginout(){
    this.setData({
      nologin:true
    })
    wx.setStorageSync('admin', null)        //若登录失败则将缓存里存放账号密码的admin赋值为null清空数据
  },
  //去管理订单页面
  gohouchu(){
    wx.navigateTo({
      url: '/pages/admindingdan/admindingdan',
    })
  }
});
