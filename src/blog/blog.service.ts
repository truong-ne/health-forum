import { Injectable } from "@nestjs/common";
import { Blog } from "./blog.schema";
import { QueryOptions } from "mongoose";
import { BlogDto, BlogIds } from "./blog.dto";

@Injectable()
export abstract class BlogsService {
  //create blog mongodb
  abstract create(blog: Blog): Promise<any>

  //delete blog mongodb
  abstract delete(id: string): Promise<any>

  //find blog by id and option
  abstract findById(id: string, options?: QueryOptions): Promise<any>

  //get blogs in page with limit
  abstract getAllBlogs(page: number, limit: number): Promise<any>

  //get blogs in page with limit by list id
  abstract getAllBlogsByIds(ids: BlogIds): Promise<any>

  //add or update blog
  abstract addOrUpdateBlog(dto: BlogDto): Promise<any>

  //delete blog
  abstract deleteBlog(id: string): Promise<any>
}