import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";

export async function GET(request) {
    const offset = +request.nextUrl.searchParams.get("offset") || 0;
    const limit = +request.nextUrl.searchParams.get("limit") || 10;

    try {
        const averias = await prisma.averia.findMany({
            take: limit,
            skip: offset,
            include: {
                vehiculosAveriados: true,
            },
        });

        return NextResponse.json(averias, { status: 200 });
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

        const {
            id, descripcion, fechaAveria, fechaComienzoReparacion,
            fechaFinReparacion, lugarReparacion, costeReparacion
        } = await request.json();

        if (id === undefined || !descripcion || !fechaAveria || !fechaComienzoReparacion ||
            !fechaFinReparacion || !lugarReparacion || costeReparacion === undefined) {
            return NextResponse.json(
                { error: "Missing data" },
                { status: 400 }
            );
        }

        const averia = await prisma.averia.create({
            data: {
                id,
                descripcion,
                fechaAveria: new Date(fechaAveria),
                fechaComienzoReparacion: new Date(fechaComienzoReparacion),
                fechaFinReparacion: new Date(fechaFinReparacion),
                lugarReparacion,
                costeReparacion,
            },
        });

        return NextResponse.json(averia, { status: 201 });
    } catch (error) {
        console.log(error);
        if (error.code === 'P2002') {
            return NextResponse.json(
                { error: "Ya existe una avería con ese ID" },
                { status: 409 }
            );
        }
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
