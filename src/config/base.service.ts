import { ModulesContainer } from '@nestjs/core';
import { AnyArray, Model, PopulateOptions } from 'mongoose';

export const getAdvanceResults = async <T extends unknown>(
  model: Model<T>,
  query: Object,
  page: number,
  limit: number,
  populate?: PopulateOptions | PopulateOptions[] | string,
  select?: string,
  sort?: any,//Object
) => {
  const items = await model
    .find(query)
    .populate(populate ? (populate as PopulateOptions) : undefined)
    .select(select ? select : undefined)
    .sort(sort ? sort : undefined)
    .skip((page - 1) * limit)
    .limit(limit);

  const totalCount = await model.countDocuments(query);
  return {
    page,
    limit,
    total: totalCount,
    data: items,
  };
};