import { Router } from "express";
import { getCategories, searchBooks } from "../controller/search.controller.js";
const searchRouter = Router()
searchRouter.route("/query").get(searchBooks)
searchRouter.route("/get-category").get(getCategories)

export default searchRouter