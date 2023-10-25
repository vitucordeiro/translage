import { type Request,type Response } from 'express';
import {type dataObjectPDF, type PageInfo, type PDFInfo } from '../typings';
import services from '../services/index';

class Controller {
    async processingPDF(Request: Request, Response: Response) {
        const to: string = Request.body.to;

        try {
            if (!to) {
                throw new Error("The language of translation was not provided by the client");
            }

            if (to === "default") {
                throw new Error("default is not a valid language");
            }

            const fileFromRequest: dataObjectPDF = Request.file;

            if (!fileFromRequest) {
                throw new Error("The file was not provided by the client");
            }

            const { path }: dataObjectPDF = fileFromRequest;

            if (!path) {
                throw new Error("The path of the file is required");
            }
            
            const result = await services.extractData(path)
            const mapContent = await services.mappingContentPDF(result,to);
            const translatedContent = await services.translate(mapContent)
            await services.createAndSavePDF(translatedContent, Response);
            console.log('opa')  


        } catch (error) {
            Response.status(400).json({ error: error.message });
        }
    return Response.sendFile('/src/view/processing.html', {root: '.'});
    }
}

export default new Controller();
