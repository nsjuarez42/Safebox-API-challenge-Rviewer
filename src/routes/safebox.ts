import type { safebox } from "./types"
import { fsDatabase as database } from "./db/fs"
const jwt = require('jsonwebtoken')
const bcrypt = require("bcrypt")
require('dotenv').config()

/*
TODO:
auth in open safebox
putSafebox by id
*/

async function addSafebox(req : any,res:any){
   
try {

    if(!req.body.name || !req.body.password){
        res.status(422).send({description:"malformed expected data"})
        throw new Error("malformed expected data")
      }

      const {name,password} : {name:string,password:string} = req.body


      const db = new database()


      if(!db.findSafeboxByName(name)){
         const hashedPassword = await bcrypt.hash(password,5)
         if(!hashedPassword){
          res.status(500).send({description:"Unexpected API error"})
          throw new Error("Unexpected API error")
         }

         const response : safebox | undefined =  db.createSafebox(name,hashedPassword)
         console.log("add safe",response)
         if(!response){
             res.status(500).send({description:"Unexpected API error"})
             throw new Error("Unexpected API error")
         }
         res.status(200).send(response)
      }
      res.status(409).send({description:"Safebox already exists"})
    
} catch (error) {
  console.log(error)
}
 
}

function openSafeboxById(req : any,res:any){
//return token

try {
    if(!req.params.id || !req.body.name || !req.body.password){
        res.status(422).send({description:"Malformed expected data"})
        throw new Error("Malformed expected data")
    }

    const {id} = req.params
    const {name,password} = req.body
    var db = new database

    //if auth fails name and password of safe throw 423
    var safe : safebox | undefined= db.readSafeboxById(id)


    if(!db.findSafeboxByName(name) || !safe){
        res.status(404).send({description:"Requested safe does not exist"})
        throw new Error("Requested safe does not exist")
    }
  
      //authentication with passport
    if(!bcrypt.compareSync(password, safe.password)){
        res.status(423).send({description:"Requested safebox is locked"})
        throw new Error("Requested safebox is locked")
    }
    const tokenData = {
        name,password
    }
    const token_expiry = 60*3*1000
    const token = jwt.sign(tokenData,process.env.TOKEN_SECRET,{
        expiresIn:token_expiry
    })

    res.status(200).send({token})

  } catch (error) {
    console.log(error)
}

}

//authenticate jwt in header
function getSafeboxById(req:any,res:any){
try {
    console.log(req.headers['authorization'],req.params.id)
    let token :string = req.headers['authorization']
    if(!token || !req.params.id){
        res.status(422).send("Malformed expected data")
        throw new Error("Malformed expected data")
    }

    token  = token.replace("Bearer ","")

    jwt.verify(token,process.env.TOKEN_SECRET,(err : any,decodedToken:any)=>{
        if(err){
            //requested safebox is locked
            //specified token does not match
        console.log(err)
         res.status(500).send({description:"Unexpected API error"})
         throw new Error("Unexpected API error")
        }
        else{
            const {id} = req.params
            const db = new database()
            const safe : safebox | undefined = db.readSafeboxById(id)
    
            if(!safe){
             res.status(404).send({description:"Requested safebox does not exist"})
            }
            if(safe !== undefined)
            res.status(200).send(safe.items)

        }
    
        
    })
} catch (error) {
    console.log(error)
}
}

function putSafeboxById(req :any ,res:any){
    try {
         //token
  if(!req.params.id || !req.body.items || !req.headers["authorization"]){
    res.status(422).send({description:"Malformed expected data"})
    throw new Error("Malformed expected data")
 }
 var token = req.headers["authorization"]
 token= token.replace("Bearer ","")
 console.log(req.body.items)

 jwt.verify(token,process.env.TOKEN_SECRET,(err:any,decodedToken:any)=>{
     if(err){
      console.log(err)
      res.status(500).send({description:"Unexpected API error"})
      throw new Error("Unexpected API error")
     }else{
      const {id} = req.params
      const db = new database()
      const {items} = req.body
      const safe:safebox | undefined = db.readSafeboxById(id)

      if(!safe){
        res.status(404).send({description:"Requested safebox does not exist"})
      }
      if(!db.editSafeBox(id,items)){
        res.status(500).send({description:"Unexpected API error"})
        throw new Error("Unexpected API error")
      }
      res.status(200).send({description:"Content correctly added"})
   
     }
 })
    } catch (error) {
        console.log(error)
    }
 
}

export {
    putSafeboxById,
    getSafeboxById,
    openSafeboxById,
    addSafebox
}