const path = require("path");
const express = require("express");
const model = require("./model");
const axios = require("axios");
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
const port = process.env.PORT || 5000

if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config();
}

app.use(express.static(path.join(__dirname, "web-build")));

app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "web-build", "index.html"));
});

const db = new model();
db.create();

app.post("/query", async (req, res) => {

    const username = req.body.username;

    if(!username){
        await getData(req, res);
    }else{
        await fetchData(req, res, username);
    }

});

app.post("/save", async (req, res) => {

    try{

        const saved = await db.save(req.body.media);

        if(saved){
            res.status(200).send({status:"done"});
        }else{
            res.status(404).send("Update failed");
        }

    }catch(ex){
        return res.status(404).send("Update failed");
    }

});

const getData = async (req, res) => {

    try{
        const result = await db.query();

        if(result){
            res.status(200).send(result);
        }else{
            res.status(404).send("Data not found");
        }
    }catch(ex){
        res.status(404).send("Data not found");
    }

}

const fetchData = async (req, res, username) => {

    try{

        const result = await query(username);

        const saved = await db.save(result);

        if(saved){
            res.status(200).send(result);
        }else{
            res.status(404).send("User not found");
        }

    }catch(ex){
        return res.status(404).send("Error occur");
    }

}

const query = async (username) => {
    const user_name = username;
    const access_token = process.env.TOKEN
    const user_id = process.env.USER_ID
    const get_count = 15;
    const url = `https://graph.facebook.com/v12.0/${user_id}?fields=business_discovery.username(${user_name}){id,media_count,ig_id,media.limit(${get_count}){id,media_url,media_type,children{id,media_url,media_type}}}&access_token=${access_token}`;

    const response = await axios.get(url);
    return getDataArray(username, response.data);
}

const getDataArray = (username, data) =>{

    const media = [];

    const root = data.business_discovery;
    root.media.data.filter( (data) => data.media_type !== "VIDEO").forEach( (e) => {

        if(e.children){
            e.children.data.filter((data) => data.media_type !== "VIDEO").forEach((e) =>{
                media.push({id:e.id, media_url: e.media_url})
            })

        }else{
            media.push({id:e.id, media_url: e.media_url})
        }
    })

    const rowIndex = 0;
    return {username, media, rowIndex};
}

app.listen(port, () => {
    console.log(`Start server on port ${port}.`);
});