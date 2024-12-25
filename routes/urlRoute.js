import express from "express";
import {  getAnayltics, getOverallAnalytics, getTopicAnalytics, redirectUrl, urlGenerate } from "../controller/urlController.js";

export const routeUrl = express.Router();

routeUrl.post("/shorten", urlGenerate);
routeUrl.get("/shorten/:alias", redirectUrl);
routeUrl.get("/analytics/:alias", getAnayltics);
routeUrl.get("/analytics/topic/:topic", getTopicAnalytics);
routeUrl.get("/analytics/overall", getOverallAnalytics);