import { Translate } from "@google-cloud/translate/build/src/v2";
import dotenv from 'dotenv'
dotenv.config();
const translate = new Translate({key: process.env.API_KEY});

export default translate;