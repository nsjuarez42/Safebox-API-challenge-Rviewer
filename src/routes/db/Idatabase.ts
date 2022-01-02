//add function to cipher data

import { safebox } from "../types";

interface Idatabase {
    createSafebox(name:string,password:string) : safebox | undefined
    readSafeboxById(id:string) : safebox | undefined
    findSafeboxByName(name:string) : boolean
    cipherData(data : any) : string
    decipherData(cipheredData:string) : safebox | undefined
    editSafeBox(id:string,items : any[]) : boolean
}

export default Idatabase