
type safebox = {
    name:string,
    password:string,
    items:any[],
    id:string
}

type db = {
    safeboxes: string[]
}
export type{safebox,db}
