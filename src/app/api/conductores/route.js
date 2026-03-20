import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";



export async function GET(request) {
    const offset = +request.nextUrl.searchParams.get("offset") || 0;
    const limit = +request.nextUrl.searchParams.get("limit") || 10;

    try {
        const conductores = await prisma.conductor.findMany({
            take: limit,
            skip: offset,
            include: {
                vehiculo: true,
                infoEspecificaTrayectos: true,
            },
        });

        return NextResponse.json(conductores, { status: 200 });
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
        const { id } = jwt.verify(token, process.env.JWT_SECRET);
        const user = await prisma.user.findUnique({ where: { id } });

        if (!user) {
            return NextResponse.json(
                { error: "Unauthorized. Token expired or invalid." },
                { status: 401 }
            );
        }

        const { dni, nombre, apellidos, telefono, direccion, fechaNacimiento } = await request.json();

        if (!dni || !nombre || !apellidos || !telefono || !direccion || !fechaNacimiento) {
            return NextResponse.json(
                { error: "Missing data" },
                { status: 400 }
            );
        }

        const conductor = await prisma.conductor.create({
            data: {
                dni,
                nombre,
                apellidos,
                telefono,
                direccion,
                fechaNacimiento: new Date(fechaNacimiento),
            },
        });

        return NextResponse.json(conductor, { status: 201 });
    } catch (error) {
        console.log(error);
        if (error.code === 'P2002') {
            return NextResponse.json(
                { error: "El conductor con ese DNI ya existe" },
                { status: 409 }
            );
        }
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
