import { users, products, productImages } from './data.mjs';

import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();


const resetDatabase = async () => {
    console.log("Reiniciando base de datos (TRUNCATE)...");
    // PostgreSQL
    await prisma.$executeRaw`TRUNCATE TABLE "users", "products", "product_images" RESTART IDENTITY CASCADE;`;
}


async function main() {
    // PELIGRO: Borramos todo
    await resetDatabase()

    console.log("Añadiendo usuarios...")
    await prisma.user.createMany({
        data: users,
        skipDuplicates: true,
    });

    console.log("Añadiendo productos...")
    await prisma.product.createMany({
        data: products,
        skipDuplicates: true,
    });

    console.log("Añadiendo imágenes...")
    await prisma.productImage.createMany({
        data: productImages,
        skipDuplicates: true,
    });

    console.log("Listo!")
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
