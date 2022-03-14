const sqlite3 = require("sqlite3");
const { Pool } = require('pg');

class sqlite{

    constructor(){

        this.client = new sqlite3.Database("./media.db", (err) => {
            if (err) {
                console.error("database error: " + err.message);
            }
        });
    }

    async create(){
        const call = () => {
            return new Promise((resolve, reject) => {
                this.client.serialize(() => {
                    this.client.run("create table if not exists media(" +
                            "id text primary key," +
                            "media text"+
                            ")"
                        , (err) => {
                            if (err) {
                                console.error("table error: " + err.message);
                                reject(err);
                            } else{
                                resolve(null);
                            }
                        });
                });
            });
        }

        try{
            await call();
        }catch(ex){
            console.log(ex);
        }

    }

    async query(){

        const call = () => {
            return new Promise((resolve, reject) => {
                this.client.get("SELECT id,media FROM media", function(err, row) {
                    if (err || !row) {
                        reject(err)
                    }else{
                        resolve(row);
                    }
                });
            })
        }

        try{
            const result = await call();

            return result.media;
        }catch(ex){
            console.log(ex);
            return null;
        }

    }

    async save(media){

        const stmt = this.client.prepare("replace into media(id, media) values('test',JSON(?))");

        const call = () => {

            return new Promise((resolve, reject) => {
                stmt.run(JSON.stringify(media), (err, result) => {
                    if (err) {
                        reject(err);
                    }else{
                        resolve(result);
                    }
                });
            })
        }

        try{
            await call();
            return true;
        }catch(ex){
            console.log(ex);
            return false;
        }
    }

}

class postgre{

    constructor(){
        this.pool = new Pool({
            connectionString: process.env.DATABASE_URL,
            ssl: {
              rejectUnauthorized: false
            }
        });
    }

    async create(){

        const client = await this.pool.connect();

        try{
            const command = "CREATE TABLE IF NOT EXISTS media ( " +
            "id text primary key, " +
            "media jsonb" +
            ")";

            await client.query(command);

        }catch(ex){
            console.log("create table failed");
            console.log(ex);
        }finally{
            client.release();
        }

    }

    async query(){

        const client = await this.pool.connect();

        try{
            const command = "SELECT id,media FROM media WHERE id = $1";

            const result = await client.query(command, ["test"]);

            return result.rows[0].media;

        }catch(ex){
            console.log("query failed");
            console.log(ex);
            return null;

        }finally{
            client.release();
        }

    }

    async save(media){

        const client = await this.pool.connect();

        try{
            const command = "insert into media(id, media) values('test', $1) " +
            "ON CONFLICT (id) DO UPDATE SET media = $1";

            await client.query("BEGIN")

            await client.query(command, [media]);

            await client.query("COMMIT")

            return true;

        }catch(ex){
            console.log("insert failed");
            console.log(ex);
            return false;

        }finally{
            client.release();
        }

    }
}

let model;
if (process.env.NODE_ENV !== 'production') {
    model = sqlite;
} else {
    model = postgre;
}

module.exports = model;