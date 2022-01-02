
import express from 'express'
import { addSafebox,putSafeboxById,getSafeboxById,openSafeboxById } from "./routes/safebox"

/*
if token expires user needs to open safebox again

use databases in a way that are easily changed
const {database:databaseType} = require("database type")

factory pattern

tests

block db with blocked attribute in safebox type
,failed attempts in safebox as well

documentation
*/
const app = express()
app.use(express.urlencoded())


app.post('/safebox',addSafebox)
app.get('/safebox/:id/open',openSafeboxById)
app.route('/safebox/:id/items')
   .get(getSafeboxById)
   .put(putSafeboxById)

const port  = process.env.PORT || 3000

app.listen(port,()=>{
console.log(`app is listening on port ${port}`)
})