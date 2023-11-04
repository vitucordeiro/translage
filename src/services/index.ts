import pdfExtract from '../config/pdfExtract';
import pdfCreate from '../config/pdfCreate';
import { response, type Response } from 'express';
import type { PDFInfo, PageInfo } from '../typings';
import translate from '../config/translate';
import fs from 'fs'

/**  */
class Services {
    
    async extractData(path, options?) {
        return new Promise<PDFInfo>((resolve, reject) => {
            pdfExtract.extract(path, options, async (err, data) => {
                if (err) {
                    console.error(err);
                    reject(err);
                } else {
                    resolve(data)
                }
            });
        });
    }
    
    async mappingContentPDF(data, to) {
        return new Promise<PageInfo>((resolve, reject) => {
            const pagesLength = data.pages.length;
            const pageInfo: PageInfo = {
                pages: []
            };
    
            for (let i = 0; i < pagesLength; i++) {
                const pageData = data.pages[i];
                const contentAndCoordinates = pageData.content.map(data => {
                    let content = data["str"].trim();
                    if(content != ''){
                        return {
                            content: data["str"],
                            coordinates: {
                                x: Math.round(data["x"]),
                                y: Math.round(data["y"])
                            }
                        };
                    }
                    return null
                });
                // if remove the filter, remove the null values that return from content.map
                const filteredContentAndCoordinates = contentAndCoordinates.filter(item => item !== null);

               
                pageInfo.pages.push({
                    to: to,
                    pageNumber: i + 1,
                    data: filteredContentAndCoordinates
                });
            }
            
            resolve(pageInfo);
        });
    }

    async translate(pageInfo: PageInfo) {
        const pagesLength = pageInfo.pages.length;
        for (let i = 0; i < pagesLength; i++) {
          const translatedContents = await Promise.all(
            pageInfo.pages[i].data.map(async (data) => {
              const [translation] = await translate.translate(data.content, pageInfo.pages[i].to);
              return { ...data, content: translation };
            })
          );
          pageInfo.pages[i] = { ...pageInfo.pages[i], data: translatedContents };
        }
        return pageInfo;
      }
      // Comportamento inesperado nesta função. O retorno inesperado pode ser devido às linhas (88 - 102)
      private async createPDF(pageInfo:PageInfo, pagesLength:number) {
        return new Promise<Buffer>((resolve, reject) => {
          try{
            console.time('Creating PDF');
            // Configuração do Pdfkit
            const pdfDoc = pdfCreate 
            const buffers: Buffer[] = [];
            pdfDoc.on('data', buffers.push.bind(buffers));
  
            pdfDoc.on('end', () => {
              const pdfData = Buffer.concat(buffers);
              resolve(pdfData);
            });
        
            for (let j = 0; j < pagesLength; j++) {
  
              pdfDoc.addPage();
              pdfDoc.switchToPage(j);
              // bug 
              let data = pageInfo.pages[j].data;
              for(let i = 0; i < data.length; i++) {  

                let content = data[i].content
                let stringContent = content.toString();
                let { x, y } = data[i].coordinates;
                pdfDoc.text(stringContent, x, y);
                pdfDoc.moveDown();
          
              }
            }
        
            pdfDoc.end();
            console.timeEnd('Creating PDF');
          }catch(error){
            reject(error);
          }
        });
      }
      
      async createAndSavePDF(pageInfo:PageInfo, pagesLength:number, Response) {
        try {
          
          const pdfData = await this.createPDF(pageInfo, pagesLength);
      
          Response.setHeader('Content-Length', pdfData.length);
          Response.setHeader('Content-Type', 'application/pdf');
          Response.setHeader('Content-Disposition', 'attachment;filename=out.pdf');
      
          Response.end(pdfData);
        } catch (error) {
          Response.status(500).json({ error: error.message });
        }
      }
      
}

export default new Services();
