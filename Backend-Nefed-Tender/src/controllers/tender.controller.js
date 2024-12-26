import httpStatus from 'http-status';
import catchAsync from '../utils/catchAsync.js';
import { ViewTender as ViewTenderService , CreateTender as CreateTenderService
  } from '../services/tender.service.js';

export const CreateTender = catchAsync(async(req,res)=>{
  let input = req.body;
  input.created_by = req.user.id;
  const data = await CreateTenderService(input);
  res.status(httpStatus.CREATED).json({data});
})

export const ViewTender = catchAsync(async(req,res) => {
const data = await ViewTenderService(req.user);
res.status(200).send(data);
})

