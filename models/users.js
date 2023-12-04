const { getDb } = require('../util/database');
const { ObjectId } = require('mongodb');

class User {
    constructor(name,email,password,totalexpenses){
        this.name=name;
        this.email=email;
        this.password=password;
        this.totalexpenses=totalexpenses;
        this.ispremiumuser=false;
        this.downloadUrl = [];
        this.forgotPassword = {};
        this.order = {};
    }
    save(){
        let db=getDb();
        return db.collection('Users').insertOne(this);
    }
    static fetchByEmail(email){
        let db=getDb();
        return db.collection('Users').findOne({email});
    }
    static fetchById(_id) {
        const db = getDb();
        return db.collection('Users').findOne({ _id: new ObjectId(_id) });
    }
    static createForgotPassword(_id, obj) {
        const db = getDb();
        return db.collection('Users').updateOne({ _id }, { $set: { "forgotPassword": obj } })
    }
    static updateForgotPassword(_id, obj) {
        const db = getDb();
        return db.collection('Users').updateOne({ _id }, { $set: { "forgotPassword": obj } })
    }
    static updatePassword(_id, password) {
        const db = getDb();
        return db.collection('Users').updateOne({ _id }, { $set: { "password": password } })
    }
    static fetchByForgotId(forgotId) {
        const db = getDb();
        return db.collection('Users').findOne({ "forgotPassword.forgotId": forgotId });
    }
    static createOrder(userId,order){
        const db = getDb();
        return db.collection("Users")
        .updateOne({_id : new ObjectId(userId)},{$set:{"order":order }});   
    }
    static updateOrder(UsersId,order){
        const db = getDb();
        return db.collection("Users")
        .updateOne({_id : new ObjectId(UsersId)},{$set:{ "order":order ,"ispremiumuser":true}});   
    }
    static saveDownloadHistory(_id,url){
        const db=getDb();
        return db.collection('Users').updateOne({_id : new ObjectId(_id)},{$push:{"downloadUrl":url}});
    }

}
module.exports=User;