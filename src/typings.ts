import { type IRouter } from "express"


export interface IRoutesConfig {
    routes : IRouter 
}

export type dataObjectPDF = {
    fieldname: string,
    originalname: string,
    encoding: string,
    mimetype: string,
    destination: string,
    filename: string,
    path: string,
    size: number
  }

export interface PDFInfo {
    meta: {
      info: {
        PDFFormatVersion: string;
        Language: string | null;
        EncryptFilterName: string | null;
        IsLinearized: boolean;
        IsAcroFormPresent: boolean;
        IsXFAPresent: boolean;
        IsCollectionPresent: boolean;
        IsSignaturesPresent: boolean;
        Title: string;
        Producer: string;
      };
      metadata: any | null;
    };
    pages: {
      pageInfo: Record<string, any>;
      links: Array<any>;
      content: Array<any>;
    }[];
    pdfInfo?: any;
    filename: string;
  }

export interface TranslateOption {
    from?: string | undefined;
    to?: string | undefined;
    raw?: boolean | undefined;
}
export interface TranslateResult {
    text: string;
    from: {
        language: {
            didYouMean: boolean;
            iso: string;
        };
        text: {
            autoCorrected: boolean;
            value: string;
            didYouMean: boolean;
        };
    };
    raw: string;
}
export declare function translate(text: string, options?: TranslateOption): Promise<TranslateResult>;
 


export interface PageInfo {
  pages: {
      to:string;
      pageNumber: number;
      data:{
        content: [string | string[], any] | string[] ;
        coordinates?: {
            x: number;
            y: number;
        };
      }[]

  }[];
}