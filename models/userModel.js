const mongoose=require('mongoose');
const Joi=require("joi");
const jwt=require("jsonwebtoken");
const{config}=require("../config/secret")
const userSchema=new mongoose.Schema({
    name:String,
    email:String,
    password:String,
    dateCreated:{
        type:Date, default:Date.now()
    },
    role:{
        type:String, default:"user"
    }
})
exports.UserModel=mongoose.model("users",userSchema);
exports.createToken=(_id,role)=>{
    let token=jwt.sign({_id,role},config.tokenSecret,{expiresIn:"60mins"});
    return token;
}
exports.userValid=(_reqBody)=>{
    let joiSchema=Joi.object({
        name:Joi.string().min(2).max(99).required(),
        email:Joi.string().min(2).max(9999).required(),
        password:Joi.string().min(2).max(99999).required()
    })
    return joiSchema.validate(_reqBody);    
}
exports.userValidLogin=(_reqBody)=>{
    let joiSchema=Joi.object({
        email:Joi.string().min(2).max(9999).required(),
        password:Joi.string().min(2).max(99999).required()
    })
    return joiSchema.validate(_reqBody);    
}