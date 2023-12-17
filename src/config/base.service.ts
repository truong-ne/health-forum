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


export abstract class BaseService {
  constructor() {

  }

  VNTime(n = 0) {
      const now = new Date()
      const time = new Date(Date.UTC(
          now.getUTCFullYear(),
          now.getUTCMonth(),
          now.getUTCDate() + n,
          now.getUTCHours() + 7,
          now.getUTCMinutes(),
          now.getUTCSeconds(),
          now.getUTCMilliseconds()
      ))
      return time
  }

  async updateMeilisearch(table: string, data: any) {
    const response = await fetch('https://meilisearch-truongne.koyeb.app/indexes/' + table + '/documents', {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": "Bearer CHOPPER_LOVE_MEILISEARCH",
        },
        body: JSON.stringify(data),
    });
  }

  async deleteTableMeilisearch(table: string) {
    const response = await fetch('https://meilisearch-truongne.koyeb.app/indexes/' + table + '/documents', {
        method: "DELETE",
        headers: {
            "Content-Type": "application/json",
            "Authorization": "Bearer CHOPPER_LOVE_MEILISEARCH",
        },
    });
  }

  async deleteIndexMeilisearch(table: string, id: string) {
    const response = await fetch('https://meilisearch-truongne.koyeb.app/indexes/' + table + '/documents/' + id, {
        method: "DELETE",
        headers: {
            "Content-Type": "application/json",
            "Authorization": "Bearer CHOPPER_LOVE_MEILISEARCH",
        },
    });
  }
}