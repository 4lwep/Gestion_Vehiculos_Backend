import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";




export async function GET(request, { params }) {
    const { term } = await params;


    try {
        const products = await prisma.product.findMany({
            where: {
                OR: [
                    {
                        title: {
                            contains: term,
                            mode: 'insensitive',
                        }
                    },
                    {
                        slug: {
                            contains: term,
                            mode: 'insensitive',
                        }
                    }
                ]
            },
        });

        return NextResponse.json(
            products,
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


