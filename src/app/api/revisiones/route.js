import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";

export async function GET(request) {
    const offset = +request.nextUrl.searchParams.get("offset") || 0;
    const limit = +request.nextUrl.searchParams.get("limit") || 10;

    try {
        const revisiones = await prisma.revision.findMany({
            take: limit,
            skip: offset,
        });

        return NextResponse.json(revisiones, { status: 200 });
    } catch (error) {
        console.log(error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}

export async function POST(request) {
    const authHeader = request.headers.get("Authorization");

    if (!authHeader) {
        return NextResponse.json(
            { error: "Unauthorized. Token expired or invalid." },
            { status: 401 }
        );
    }

    const token = authHeader.split(' ')[1] || authHeader;

    try {
        const { id: userId } = jwt.verify(token, process.env.JWT_SECRET);
        const user = await prisma.user.findUnique({ where: { id: userId } });

        if (!user) {
            return NextResponse.json(
                { error: "Unauthorized. Token expired or invalid." },
                { status: 401 }
            );
        }

        const { id, fecha, lugar, activo, aprobada } = await request.json();

        if (id === undefined || !fecha || !lugar || activo === undefined || aprobada === undefined) {
            return NextResponse.json(
                { error: "Missing data" },
                { status: 400 }
            );
        }

        const revision = await prisma.revision.create({
            data: {
                id,
                fecha: new Date(fecha),
                lugar,
                activo,
                aprobada,
            },
        });

        return NextResponse.json(revision, { status: 201 });
    } catch (error) {
        console.log(error);
        if (error.code === 'P2002') {
            return NextResponse.json(
                { error: "Ya existe una revisión con ese ID" },
                { status: 409 }
            );
        }
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
