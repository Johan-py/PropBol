import type { Request, Response } from "express";
import { LocationsService } from "../../modules/locations/locations.service.js";

const locationsService = new LocationsService();

export default async function locationSearchHandler(
  req: Request,
  res: Response,
) {
  try {
    const query = req.query.q as string;
    const locations = await locationsService.searchLocations(query);

    return res.status(200).json(locations);
  } catch (error) {
    console.error("Error en Location Controller:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}
