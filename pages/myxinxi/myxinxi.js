// pages/myxinxi/myxinxi.js
const app = getApp(); 

Page({
    // 页面加载时执行
  onLoad() {
    const nicheng = wx.getStorageSync('nicheng'); // 从本地缓存中获取昵称
    const dianhua = wx.getStorageSync('dianhua'); // 从本地缓存中获取电话号码

    if (nicheng) { // 检查昵称是否存在于缓存中
      this.setData({
        nicheng: nicheng // 更新页面上的昵称
      });
    }

    if (dianhua) { // 检查电话号码是否存在于缓存中
      this.setData({
        dianhua: dianhua // 更新页面上的电话号码
      });
    }
  },
  // 获取昵称输入框的值
  getname(event) {
    const nicheng = event.detail.value; // 使用event.detail.value获取输入框的值
    this.setData({
      nicheng: nicheng // 更新页面上的昵称
    });
  },
  // 获取电话输入框的值
  callnum(event) {
    const dianhua = event.detail.value; // 使用event.detail.value获取输入框的值
    this.setData({
      dianhua: dianhua // 更新页面上的电话号码
    });
  },
  // 点击保存按钮事件处理函数
  baocun() {
    const nicheng = this.data.nicheng; // 获取页面上的昵称
    const dianhua = this.data.dianhua; // 获取页面上的电话号码

    if (nicheng && dianhua) { // 检查昵称和电话号码是否已填写
      wx.setStorageSync('nicheng', nicheng); // 将昵称存储到本地缓存
      wx.setStorageSync('dianhua', dianhua); // 将电话号码存储到本地缓存

      wx.showToast({
        title: '保存成功',
        icon: 'success'
      });
    } else {
      wx.showToast({
        title: '昵称和电话号码不能为空',
        icon: 'none'
      });
    }
  }
});