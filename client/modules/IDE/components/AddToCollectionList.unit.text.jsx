import React, { Suspense } from 'react';
import { setupServer } from 'msw/lib/types/node';
import { rest } from 'msw';
import { initialTestState } from '../../../testData/testReduxStore';
import i18n from '../../../i18n-test';

let lastSearchParams;
let requestCount = 0;
let addRequestCount = 0;
let removeRequestCount = 0;








const server = setupServer(
    rest.get("/collections", (req, res, ctx)=>{
        requestCount +=1; 
        lastSearchParams = req.url.searchParams; 

        const page = Number(req.url.searchParams.get('page')?? 1); 
        const list = Number(req.url.searchParams.get('limit')?? 10);

        const collections = 
        page === 1 ? makeProjects('page1', limit): makeProjects('page2', limit);

        return res()
    })
)