// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV }) // 使用当前云环境

// 云函数入口函数
exports.main = async (event, context) => {
  const db=cloud.database()
  const _ =db.command
  let caipindata=event.foods||[]    //如果传进来的值为空则使用空数组
  let proarr=[]

  caipindata.forEach(caipindata=>{
    let pro = db.collection('caipindata').doc(caipindata._id)   //doc为操作菜品id
    .update({
      data:{
        xiaoliang:_.inc(caipindata.num)     //将传回来的caipindata里的num值赋值给云数据库里的xiaoliang数组已实现更新菜品的销量
      }
    })
    proarr.push(pro)
  });
  return await Promise.all(proarr)   //同时执行多个请求，只有所以的请求都成功才成功，有一个失败就失败
}