import axios, {AxiosRequestConfig, AxiosResponse} from "axios";

export interface media {
    id: string,
    media_url: string;
}

export interface mediaResponse {
    username: string;
    media: media[];
    rowIndex: number;
}

const emptyResponse :mediaResponse = {
    username: "",
    media: [],
    rowIndex: 0
}

export let resultMedia :mediaResponse = emptyResponse;

const query = async (username: string) => {

    const url = "/query";
    const method = "POST";
    const data = {username};

    const headers = {'Content-Type': 'application/json'}

    const options :AxiosRequestConfig = {
        method,
        url,
        headers,
        data,
    }

    try{
        const result :AxiosResponse<mediaResponse> = await axios.request(options);

        resultMedia = result.data;

        console.log(resultMedia.rowIndex)

        return result.data;

    }catch(ex:any){

        if(username){
            throw new Error(ex.response.data)
        }else{
            return emptyResponse;
        }
    }

}

const save = async () => {

    const url = "/save";
    const method = "POST";
    const data = {media: resultMedia};

    const headers = {'Content-Type': 'application/json'}

    const options :AxiosRequestConfig = {
        method,
        url,
        headers,
        data,
    }

    try{
        await axios.request(options);

    }catch(ex:any){

        throw new Error(ex.response.data)

    }

}

export { query, save }