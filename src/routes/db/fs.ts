
import type { safebox,db } from "../types"
import Idatabase from "./Idatabase"
const fs = require("fs")
const {v4:uuidv4} = require("uuid")
const cryptoJS = require("crypto-js")
require("dotenv").config({path:__dirname + '/.env'})
  

/*
TODO:

*/
//cipher data and save
//decipher data for get

const PATH = "./../data/data.json"



class fsDatabase implements Idatabase{

    constructor(){

    }
    
   private readDatabase() : db{

        const data = fs.readFileSync(PATH)
        const database : db = JSON.parse(data)
        return database
    }

   private writeDatabase(db:db) : boolean{
     try {
        fs.writeFileSync(PATH,JSON.stringify(db))
        return true
     } catch (error) {
         console.log(error)
         return false
     }
    }

     cipherData(data:any) : string{
     //aes   
     return cryptoJS.AES.encrypt(JSON.stringify(data),process.env.ENCRYPTION_SECRET).toString()
    }
     decipherData(cipheredData:string) :safebox | undefined{
     const bytes = cryptoJS.AES.decrypt(cipheredData,process.env.ENCRYPTION_SECRET)
     if(bytes !== undefined)
     return JSON.parse(bytes.toString(cryptoJS.enc.Utf8))
    }

//return safebox or undefined
   public createSafebox(name: string, password: string): safebox | undefined {
      let database : db= this.readDatabase()

      //cipher data before saving

      //generate id
      const id :string = uuidv4() 


      let safe : safebox = {
          name,password,id,items:[]
      }

      let cipheredSafe :string = this.cipherData(safe)

      database.safeboxes.push(cipheredSafe)

    const response : boolean= this.writeDatabase(database)
    console.log("createsafebox",response)
    if(!response) return undefined
    return safe

    }

   public readSafeboxById(id: string) : safebox | undefined {
         const database = this.readDatabase();
         const cipheredSafe : string | undefined= database.safeboxes.find(el=>this.decipherData(el)?.id == id)
         if(cipheredSafe !== undefined){
            const safe : safebox  | undefined = this.decipherData(cipheredSafe)

            if(!safe) return undefined
            return safe
         }
    }

   public findSafeboxByName(name:string) : boolean{
      let database:db = this.readDatabase()

      const cipheredSafe : string | undefined = database.safeboxes.find(el=>this.decipherData(el)?.name == name)

      if(cipheredSafe == undefined)
      return false

        const item : safebox | undefined =this.decipherData(cipheredSafe)
        return item !== undefined
      
     }

   public editSafeBox(id: string,items:any[]): boolean {
       let database:db =this.readDatabase()

       const cipheredSafe : string | undefined = database.safeboxes.find(el=>this.decipherData(el)?.id == id)
        if(!cipheredSafe)
        return false

       const safe:safebox |undefined = this.decipherData(cipheredSafe)

       if(!safe) return false

       const safebox_index = database.safeboxes.indexOf(cipheredSafe)
       
       safe.items.push(...items)

       const updatedSafe : string = this.cipherData(safe)

       database.safeboxes.splice(safebox_index,1,updatedSafe)

       return this.writeDatabase(database)



   }
}
export {fsDatabase}
