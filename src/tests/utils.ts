import { createRequest, createResponse } from "node-mocks-http";
import mongoose from "mongoose";

export const mockedCatchError = new Error("Error");
export const mockedCatchDuplicateAuthorError = new Error(
  `E11000 duplicate key error\"fakeName`
);

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
