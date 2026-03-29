import { propertiesRepository } from "./properties.repository.js"

export const propertiesService = {

  async search(filtros: any) {

    return propertiesRepository.search(filtros)

  }

}