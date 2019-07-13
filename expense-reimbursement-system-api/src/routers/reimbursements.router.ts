import express from 'express';

export const reimbursementsRouter = express.Router();

/**
 * All requests to this router will stem from /reimbursements
 */

reimbursementsRouter.get('/status/:statusId',(req,res)=>{
    res.send("Reimbursements by status id functionality still needs implemented!");
});

reimbursementsRouter.get('/author/userId:userId',(req,res)=>{
    res.send("Reimbursements by user functionality still needs implemented!");
});

reimbursementsRouter.post('',(req,res)=>{
    res.send("Reimbursement submissions functionality still needs implemented!");
});

reimbursementsRouter.patch('',(req,res)=>{
    res.send("Reimbursement updates functionality still needs implemented!");
});