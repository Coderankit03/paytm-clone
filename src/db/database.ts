import mongoose from "mongoose";

try{
   const conn =  mongoose.connect("mongodb+srv://ankitya1608:deBvnG937XImQkSi@paytm-cluster.qiuhcjb.mongodb.net/")
}catch(e){
    console.log(e)
}

const User = mongoose.model('User', new mongoose.Schema({ 
    email: {
        type: String,
        unique: true,
        required: true,
        minLength: 3,
        maxLength: 30,
        lowewrcase: true
    },
    password: {
        type: String,
        required: true,
        minLength: 6
    },
    firstName: {
        type: String,
        required: true,
        maxLength: 30,
    },
    lastName: {
        type: String,
        required: true,
        maxLength: 30,
    }
 }));

 export default User;