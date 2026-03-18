import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";



export async function GET(request, { params }) {
    const { id: idOrSlug } = await params;


    try {
        const product = await prisma.product.findFirst({
            where: { OR: [{ id: idOrSlug }, { slug: idOrSlug }] },
            select: {
                id: true,
                title: true,
                price: true,
                description: true,
                slug: true,
                stock: true,
                sizes: true,
                gender: true,
                tags: true,
                images: { select: { url: true } },
                user: {
                    select: {
                        id: true,
                        email: true,
                        fullName: true,
                        isActive: true,
                        roles: true,
                    },
                },
            },
        });

        if (!product) {
            return NextResponse.json(
                { message: "Product not found" },
                { status: 404 }
            );
        }

        const formattedProduct = {
            ...product,
            images: product.images.map((image) => image.url),
        };
        return NextResponse.json(
            formattedProduct,
            { status: 200 }
        );
    } catch (error) {
        console.log(error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        )
    }
}




export async function PATCH(request, { params }) {
    const { id } = await params;

    const authHeader = request.headers.get("Authorization");

    if (!authHeader) {
        return NextResponse.json(
            { error: "Unauthorized. Token expired or invalid." },
            { status: 401 }
        )
    }

    const token = authHeader.split(' ')[1] || authHeader;

    // VERIFICAMOS TOKEN
    const { id: idUser } = jwt.verify(token, process.env.JWT_SECRET);
    const user = await prisma.user.findUnique({ where: { id: idUser } });

    if (!user) {
        return NextResponse.json(
            { error: "Unauthorized. Token expired or invalid." },
            { status: 401 }
        )
    }

    try {
        const product = await prisma.product.findUnique({
            where: { id },
            include: { images: true }
        });

        if (!product) {
            return NextResponse.json(
                { message: "Product not found" },
                { status: 404 }
            );
        }

        const body = await request.json();
        const { title, price, description, slug, stock, sizes, gender, tags, images = [] } = body;

        const updatedProduct = await prisma.product.update({
            where: { id },
            data: {
                title,
                price,
                description,
                slug,
                stock,
                sizes,
                gender,
                tags,
                images: {
                    connectOrCreate: images.map(url => ({
                        where: { url },
                        create: { url }
                    })),
                    // set: images.map(url => ({
                    //     url
                    // }))
                },
                userId: idUser,
            },
            // incluimos las imágenes en la respuesta
            include: {
                images: true,
            }
        });

        return NextResponse.json(
            updatedProduct,
            { status: 200 }
        );

    } catch (error) {
        console.log(error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        )
    }
}




export async function DELETE(request, { params }) {
    const { id } = await params;

    const authHeader = request.headers.get("Authorization");

    if (!authHeader) {
        return NextResponse.json(
            { error: "Unauthorized. Token expired or invalid." },
            { status: 401 }
        )
    }

    const token = authHeader.split(' ')[1] || authHeader;

    // VERIFICAMOS TOKEN
    const { id: idUser } = jwt.verify(token, process.env.JWT_SECRET);
    const user = await prisma.user.findUnique({ where: { id: idUser } });

    if (!user) {
        return NextResponse.json(
            { error: "Unauthorized. Token expired or invalid." },
            { status: 401 }
        )
    }


    try {
        const product = await prisma.product.findUnique({ where: { id } });

        if (!product) {
            return NextResponse.json(
                { message: "Product not found" },
                { status: 404 }
            );
        }

        const deletedProduct = await prisma.product.delete({
            where: { id },
            // incluimos las imágenes en la respuesta
            include: {
                images: true,
            }
        });

        return NextResponse.json(
            deletedProduct,
            { status: 200 }
        );
    } catch (error) {
        console.log(error);
        return NextResponse.json(
            { error: "Product title or slug already exists" },
            { status: 409 }
        )
    }

}



