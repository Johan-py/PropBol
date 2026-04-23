<<<<<<< HEAD
import { prisma } from "../../lib/prisma.client.js";
=======
import { prisma } from '../../lib/prisma.client.js'
>>>>>>> 8536301fcf9e07d62083864936ac19772bd49b83
export class BannersRepository {
  async getActiveBanners() {
    // Se utiliza la instancia global del archivo db.ts para ejecutar la consulta a la base de datos.
    return await prisma.banner_home.findMany({
      where: { activo: true },
      orderBy: { orden: 'asc' }
    })
  }
}
