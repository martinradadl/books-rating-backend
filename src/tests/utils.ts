import { createRequest, createResponse } from "node-mocks-http";
import mongoose from "mongoose";

export const mockedCatchError = new Error("Error");
export const mockedCatchDuplicateKeyError = (key: string) =>
  new Error(`E11000 duplicate key error"${key}"`);

export const fakeObjectId = new mongoose.mongo.ObjectId();

export const initializeReqResMocks = () => {
  const req = createRequest({});
  const res = createResponse({});
  return { req, res };
};

export const defaultGetAllQueryObjectWithoutPopulate = (
  result: Array<Record<string, unknown>>
) => {
  return {
    limit: () => {
      return {
        skip: () => {
          return result;
        },
      };
    },
  };
};

export const applyPopulate = (
  result: Record<string, unknown> | Array<Record<string, unknown>>,
  depth: number
) => {
  if (depth <= 0) return result;
  return {
    populate: () => applyPopulate(result, depth - 1),
  };
};

export const defaultGetAllQueryObject = (
  result: Array<Record<string, unknown>>,
  populateDepth: number = 1
) => {
  return {
    limit: () => {
      return {
        skip: () => {
          return applyPopulate(result, populateDepth);
        },
      };
    },
  };
};
