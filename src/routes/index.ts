import express, { type Request, type Response, type NextFunction } from "express";
const router = express.Router();
import controller from "../controller/index";

import multer from 'multer';
const upload = multer({dest: __dirname + '/storage/upload'});

/** PDF router */
router.route('/api/v1/upload')
    .post(upload.single('pdf'), async(Request: Request, Response: Response, Next: NextFunction) => {

        

//TODO: create a middleware that listening the first return of Services.

        return await controller.processingPDF(Request, Response) 
    })

router.route('/api/v1/processing/pdf')
   .get((Request: Request, Response: Response, Next: NextFunction) => {
    Response.sendFile('/src/view/processing.html', {root: '.'})
   })

router.route('/api/v1/processing/sucess')
   .get((Request: Request, Response: Response, Next: NextFunction) => {
        Response.sendFile('/src/view/downloading.html', {root: '.'})
   } )
/**  another routes */
router.route('/')
    .get((Request: Request, Response: Response, Next: NextFunction)=>{
        Response.sendFile('/src/view/index.html', { root: '.' })  
    })

/** error 404  */
router.route('*')
   .get((Request: Request, Response: Response, Next: NextFunction)=>{
        Response.status(404).sendFile('/src/view/404.html', { root: '.' })
    })
export default router;