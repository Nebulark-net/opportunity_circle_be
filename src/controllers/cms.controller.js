import { ApiResponse } from '../utils/apiResponse.js';
import * as cmsService from '../services/cms.service.js';
import asyncHandler from '../utils/asyncHandler.js';

const getCmsPage = asyncHandler(async (req, res) => {
  const { pageKey } = req.params;
  const page = await cmsService.getCmsPage(pageKey);

  return res
    .status(200)
    .json(new ApiResponse(200, page, 'CMS page fetched successfully'));
});

const updateCmsPage = asyncHandler(async (req, res) => {
  const { pageKey } = req.params;
  const page = await cmsService.updateCmsPage(pageKey, req.user._id, req.body);

  return res
    .status(200)
    .json(new ApiResponse(200, page, 'CMS page updated successfully'));
});

const getAllCmsPages = asyncHandler(async (req, res) => {
  const pages = await cmsService.getAllCmsPages();

  return res
    .status(200)
    .json(new ApiResponse(200, pages, 'CMS pages fetched successfully'));
});

export {
  getCmsPage,
  updateCmsPage,
  getAllCmsPages,
};
