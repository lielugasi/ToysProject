const express = require("express");
const { ToyModel, validToy } = require("../models/toyModel");
const { auth } = require("../middlewares/auth");
const router = express.Router();

//rout #1 get all toys
router.get("/", async (req, res) => {

  let perPage = req.query.perPage || 10;
  let page = req.query.page || 1;
  let sort = req.query.sort || "_id";
  let reverse = req.query.reverse == "yes" ? -1 : 1;

  try {
    let data = await ToyModel
      .find({}) 
      .limit(perPage)
      .skip((page - 1) * perPage)
      .sort({ [sort]: reverse })
    res.json(data);
  }
  catch (err) {
    console.log(err)
    res.status(500).json({ msg: "err", err })
  }
})

//roter #2 get toys by name or info
router.get("/search", async (req, res) => {
  let perPage = req.query.perPage || 10;
  try {
    let searchQ = req.query.s;
    let searchReg = new RegExp(searchQ, "i")
    let data = await ToyModel.find({ $or: [{ name: searchReg }, { info: searchReg }] })
      .limit(perPage)
    res.json(data);
  }
  catch (err) {
    console.log(err);
    res.status(500).json({ msg: "There is error try again later", err })
  }
})

//router #3 get toys by category
router.get("/category/:category", async (req, res) => {
  let perPage = req.query.perPage || 10;
  try {
    let categoryParam = req.params.category;
    let searchReg = new RegExp(categoryParam, "i")
    let data = await ToyModel.find({ category: searchReg })
      .limit(perPage);
    res.json(data);
  }
  catch (err) {
    console.log(err);
    res.status(500).json({ msg: "There is error try again later", err })
  }
})

//router #4 post- add a toy to the store
router.post("/", auth, async (req, res) => {
  let validateBody = validToy(req.body);
  if (validateBody.error) {
    return res.status(400).json(validateBody.error.details);
  }
  try {
    let toy = new ToyModel(req.body);
    toy.user_id = req.tokenData._id;
    await toy.save();
    res.status(201).json(toy);
  }
  catch (err) {
    console.log(err);
    res.status(500).json({ msg: "err", err });
  }
})

//router #5 edit specific toy by id
router.put("/:idedit", auth, async (req, res) => {
  let validateBody = validToy(req.body);
  if (validateBody.error) {
    return res.status(400).json(validateBody.error.details);
  }
  try {
    let idEdit = req.params.idedit;
    let data;
    if (req.tokenData.role == "admin") {
      data = await ToyModel.updateOne({ _id: idEdit }, req.body);
    }
    else {
      data = await ToyModel.updateOne({ _id: idEdit, user_id: req.tokenData._id }, req.body);
    }
    res.json(data);
  }
  catch (err) {
    console.log(err);
    res.status(500).json({ msg: "err", err });
  }

})
router.delete("/:idDel", auth, async (req, res) => {
  try{
    let idDel=req.params.idDel;
    let data;
    if(req.tokenData.role=="admin"){
      data=await ToyModel.deleteOne({_id:idDel});
    }
    else{
      data=await ToyModel.deleteOne({_id:idDel,user_id:req.tokenData._id});
    }
    res.status(201).json(data);
  }
  catch(err){
    console.log(err);
    res.status(500).json({msg:"err",err});
  }
})
router.get("/single/:id", async (req, res) => {
  try{
  let idToy = req.params.id;
  let data = await ToyModel.findOne({ _id: idToy });
  res.json(data);
  }
  catch(err){
    console.log(err);
    res.status(500).json({msg:"err",err})
  }
})

router.get("/prices",async(req,res)=>{
  let perPage = req.query.perPage || 10;
  let minQuery=req.query.min||0;
  let maxQuery=req.query.max||Infinity;
  try{
    let data=await ToyModel.find({price: { $gte: minQuery, $lte: maxQuery }}).
  limit(perPage);
  res.json(data);
  }
  catch(err){
    console.log(err);
    res.status(500).json({msg:"err",err});
  }
})
module.exports = router;
