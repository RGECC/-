// pages/diancan/diancan.js
//全局变量将wx.cloud.database()定义为db
const db=wx.cloud.database()
const $=db.command.aggregate
Page({

  data: {
    //给轮播图一个空的变量存放
    list:[],
    foodlist:[],
    totalprince:0,  //将总价格的初始值设置为0
    totalnum:0,      //将总数量的初始值设置为0
    gouwuchelist:[],//购物车数据
    ishiddenmengceng:true, //默认进入页面的时候蒙层关闭不显示
    leftlist:0      //左侧选择栏条目初始tab
  },
  onShow(){
    this.getleftroot()//调用获取左边分类栏方法
    // 获取本地缓存中的清空购物车标志
    const clearCart = wx.getStorageSync('clearCart');
    // 如果标志为 true，则执行清空购物车操作，并将默认值设置为 false
    if (clearCart) {
      this.clearcart();               
      wx.setStorageSync('clearCart', false);
    }

    let gouwuchelist=wx.getStorageSync('cart')||[]  //将缓存里的购物车数据赋值给gouwuchelist并写入这个对象里
    this.setData({
      gouwuchelist:gouwuchelist,
    })
  },
  //获取左边分类栏方法
  getleftroot(){
    db.collection('caipindata').aggregate()             //获取到云数据库里存放菜品分类的数据库表
      .group({
        _id:'$fenlei'                     //数据库存放菜品分类的表
      }).end()
      .then(res=>{
        console.log('分类',res)
        this.setData({
          tabs:res.list                   //将获取到的分类写进list里
        })
        this.getlist()//调用获取菜品列表的代码,getlist放在这里能实现进来就有分类数据
      })
  },
  onLoad(options) {
    this.getleftroot()//调用获取左边分类栏方法
    this.getlunbotu() //调用获取顶部轮播图的代码方法
        let gouwuchelist=wx.getStorageSync('cart')||[]  //如果本地数组有数据的话则直接赋给gouwuchelist，如果没有数据的话则赋一个空数组给gouwuchelist
    console.log("本地缓存的购物车数据",gouwuchelist)
    this.setData({
      gouwuchelist:gouwuchelist
    })
  },
  selecttap(e){
    this.setData({
      leftlist:e.currentTarget.dataset.index      //将获取到的左侧选择栏index数赋给leftlist对象以实现点击切换tag的功能
    })
    this.getlist()      //每点击一遍左侧选择栏就重新拉取一次菜品列表
  },
    // 计算总价格和总数量
    getTotal() {
      let gouwuchelist = this.data.gouwuchelist
      let totalprince = 0
      let totalnum = 0
  
      gouwuchelist.forEach(item => {
        totalnum += item.num
        totalprince += item.num * item.prince
      })
      this.setData({
        totalprince,
        totalnum
      })
    },


  //获取顶部轮播图
  getlunbotu(){
        //在联网状态下获取微信云数据库内的轮播图图片
        db.collection('lunbotu').get()      //const db=wx.cloud.database()，从云数据库中获取名叫lunbotu的数据库表中的图片
        .then(res=>{
          console.log('轮播图获取成功',res)
          this.setData({
            list:res.data               //将获取到的图片存入到list数组中
          })
        })
        .catch(res=>{
          console.log('轮播图获取失败请重试',res)
          this.setData({
            list:[]
          })
        })
  },
  //获取菜品列表
  getlist(){
    let gouwuchelist = this.data.gouwuchelist       // 从页面数据中获取购物车列表数据
    db.collection('caipindata') //存放菜品信息的数据库列表
    //使用where函数来筛选显示出来已上架的商品，如果商品标注的是已下架则不显示
    .where({
      shangxiajia: "shangjia",
      fenlei:this.data.tabs[this.data.leftlist]._id   //获取到appdata里的tabs里的分类数据并赋值给fenlei这个对象
    })
    .get()
      .then(res => {
        console.log("菜品列表",res)
        let list=res.data   // 从数据库查询结果中获取data表中的菜品列表数据
        if(list&&list.length>0){    // 检查菜品列表是否有效且不为空
          list.forEach(item=>{
            if(gouwuchelist&&gouwuchelist.length>0){     //如果购物车数组里有数则将购物车里的信息和数量与页面上的信息同步，否则数量归零
              //查询购物车数组里是否有当前点击的菜品
              let result = gouwuchelist.find(cart=>{
                return cart._id == item._id;        //同步操作
                })
                if(result){                       //如果result本地缓存数组不为空的话则与页面同步信息
                  item.num = result.num           //本地缓存的购物车信息与当前页面上的数量等信息同步
                }else{
                  item.num= 0               
                }}else{
                  item.num= 0}
          })
          this.setData({
            foodlist:list,             // 更新页面的菜品列表数据，使其显示在页面上，将处理后的菜品列表数据设置到页面数据中
          })
          this.getTotal()
        }
      })
  },
    //点击增加功能,并设置a为函数jia的参数，
    jia(a){
      //a.currentTarget.dataset.id是从事件对象中获取了一个名为 id 的数据
      let id = a.currentTarget.dataset.id
      console.log('点击了加号',a.currentTarget.dataset.id)
      let list = this.data.foodlist       // 从页面数据中获取菜品列表数据
      let gouwuchelist = this.data.gouwuchelist       // 从页面数据中获取购物车列表数据
      let totalprince = this.data.totalprince         // 从页面数据中获取购物车中所有菜品的总价格
      let totalnum = this.data.totalnum             // 从页面数据中获取购物车中所有菜品的总数量
      list.forEach(item => {      //遍历list数组
        if(item._id == id){       //每点击一次加号键则在数量上加1
          item.num +=1
          totalprince += item.prince      //每点击一次则增加一次目标商品的价格到总价处
          totalnum +=1      //每点击一次则增加一件目标商品数量到总菜品数处
          if (gouwuchelist && gouwuchelist.length>0){
            //判断购物车数组里是否存在着当前点击的菜品，若存在则将菜品信息重合的部分合在一起，并将num数量加1
            var result = gouwuchelist.find(cart=>{  
              return cart._id == id;      //使用find方法让添加进购物车里的菜品如有重复信息的话两者合并重复信息为一体
            })
            console.log("当前点击的菜是否存在于购物车里")
            if(result){   //判断如果点击的菜在购物车里的话，直接添加进去
              result.num=item.num
            }else{
              gouwuchelist.push(item)  //判断如果点击的菜没有在购物车里的话，直接添加该菜品到列表中去
            }
          }
          else{
            gouwuchelist.push(item)         //每点击一次则将整个菜品信息添加到购物车中
          }
        }
      })
      console.log('此时的菜品列表',gouwuchelist)
      this.setData({
        foodlist:list,        //将处理后的菜品列表数据设置到页面数据中,如下也是
        totalprince,
        totalnum,
        gouwuchelist
      })
      wx.setStorageSync('cart', gouwuchelist)     //点完加号完成所有操作后将修改后的购物车列表缓存下来
    },
    //点击减少功能
    jian(a){
          //a.currentTarget.dataset.id是从事件对象中获取了一个名为 id 的数据
          let id = a.currentTarget.dataset.id
          console.log('点击了减号',a.currentTarget.dataset.id)
          let list = this.data.foodlist       // 从页面数据中获取菜品列表数据
          let gouwuchelist = this.data.gouwuchelist       // 从页面数据中获取购物车列表数据
          let totalprince = this.data.totalprince         // 从页面数据中获取购物车中所有菜品的总价格
          let totalnum = this.data.totalnum             // 从页面数据中获取购物车中所有菜品的总数量
          list.forEach(item => {      //遍历list数组
            if(item._id == id){       //每点击一次减号键则在数量上减一
              if(item.num>0){
                item.num -=1
                totalprince -= item.prince      //每点击一次则减少一次目标商品的价格到总价处
                totalnum -=1      //每点击一次则减少一件目标商品数量到总菜品数处
                //查询购物车数组里是否有当前点击的菜品
                  var index = gouwuchelist.findIndex(cart=>{      //设置一个index值给每个菜品数组，每个菜品数组都有按照顺序的index编号
                    return cart._id == id;
                  })
                  if(index > -1 ){
                    gouwuchelist[index].num = item.num    //如果index的值大于等于0时则将购物车中的列表菜品的数量和页面的菜品的数量同步
                  }
                  if(item.num == 0){   
                    gouwuchelist.splice(index,1)  //如果页面菜品的数量等于0时则删除掉index编号为1的那个菜品数组
                    //不应该用pop，这里pop是删除并返回数组的最后一个元素
                  }
              }
              else{                   //如果按减号的时候菜品数量等于0的话则弹出“菜品数量不能小于0哦”的提示窗口
                wx.showToast({
                  icon:'none',         //隐藏掉弹窗默认的提示图
                  title: '菜品数量不能小于0哦',
                })
              }
            }
          })
          console.log('此时的菜品列表',gouwuchelist)
          this.setData({
            foodlist:list,        //将处理后的菜品列表数据设置到页面数据中,如下也是
            totalprince,
            totalnum,
            gouwuchelist
          })
          wx.setStorageSync('cart', gouwuchelist)     //点完加号完成所有操作后将修改后的购物车列表缓存下来
    },
    //打开购物车展开的蒙层
    openmengceng(){
          this.setData({
            ishiddenmengceng:false
          })
        },
    //关闭购物车展开的蒙层
    closemengceng(){
      this.setData({
        ishiddenmengceng:true
      })
    },
    //清空购物车
    clearcart(){
      let foodlist=this.data.foodlist  
      foodlist.forEach(item=>{   //遍历一遍菜品列表并将菜品数量值赋为0
        item.num=0
      })
      this.setData({      //将购物车数组赋为空数组，总数量和总价格都赋为0
        foodlist,
        gouwuchelist:[],
        totalnum:0,
        totalprince:0
      })
      wx.setStorageSync('cart', null)       //将本地缓存数组清空为null或者空数组，这里直接赋值为null
    },
    //删除购物车里面的一条数据
    close_itemlist(c){
      let index = c.currentTarget.dataset.index    //拿到购物车列表每行的index编号并赋值给c变量
      let gouwuchelist = this.data.gouwuchelist   //拿到购物车列表的数据
      let cart=gouwuchelist[index]
      let foodlist=this.data.foodlist  //遍历菜品列表, 把要删除的菜品的数量赋为为0，即清空数量
      foodlist.forEach(item=>{
        if(cart._id == item._id){
          item.num=0
        }
      })
      gouwuchelist.splice(index,1)   //从购物车数组里删除1条菜品
      this.setData({
        foodlist,
        gouwuchelist              //把变化后的数据渲染到页面上去
      })
      this.getTotal()  //重新计算购物车总价格
      wx.setStorageSync('cart', gouwuchelist)    //把更新后的数据重新写入到缓存中去
      },
      goorder(){
        let gouwuchelist = this.data.gouwuchelist       // 从页面数据中获取购物车列表数据
        if(!gouwuchelist.length>0){
          wx.showToast({
            icon:'error',
            title: '您还没有点菜呢',
          })
        }else{
          wx.navigateTo({
            url: '/pages/order/order',
          })
        }
      },
      //点击右上角分享
      onShareAppMessage:function(){

      }
})
