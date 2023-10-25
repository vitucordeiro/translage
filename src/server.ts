import express , {type Express}  from "express";
import router from "./routes/index";

/** imports*/
import bodyParser from "body-parser";
import cors, { type CorsOptions } from 'cors';

/** config */
const corsOptions:CorsOptions = {
    origin:'*',
}

/** server*/
class main {
    protected PORT: string | number | null; 
    protected app:Express = express();

    constructor(PORT?: string | number | null ) {
        this.PORT = PORT;
    }

    private configuration(){
        console.time("time to initialize server");

        this.app.use(bodyParser.json());
        this.app.use(bodyParser.urlencoded({
            extended:true,
        }));
        this.app.use(cors(corsOptions));
        this.app.use(router);

        
        console.log("Configuration: OK")

    }
    public async bootstrap(){
        /** */
        await this.configuration();

        this.app.listen('8080', ()=>{
            console.log(`Server on port ${this.PORT}`)
        })
        console.log("Bootstrap: OK")
        console.timeEnd("time to initialize server");

    }
}

/** running */
const initialize = new main(8080)
initialize.bootstrap()
