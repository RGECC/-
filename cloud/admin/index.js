// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV }) // 使用当前云环境

// 云函数入口函数
const db=cloud.database()
exports.main = async (event, context) => {
  if(event.type=='get'){
    return await db.collection('dingdan')
    .where({
      zhuangtai:event.zhuangtai
    }).get()
  }else if(event.type=='update'){
    return await db.collection('dingdan').doc(event.id)   //修改数据库订单
    .update({
      data:{
        //订单的状态：-1订单取消，0新下单未上菜，1已上餐待评价，2订单已完成
        zhuangtai:event.zhuangtai
      }
    })
  }
}