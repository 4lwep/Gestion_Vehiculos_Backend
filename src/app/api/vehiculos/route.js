import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";



export async function GET(request) {
    const offset = +request.nextUrl.searchParams.get("offset") || 0;
    const limit = +request.nextUrl.searchParams.get("limit") || 10;

    try {
        const vehiculos = await prisma.vehiculo.findMany({
            take: limit,
            skip: offset,
            include: {
                conductor: true,
                averia: true,
                imagen: true,
            },
        });

        return NextResponse.json(vehiculos, { status: 200 });
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

        const {
            matricula, marca, modelo, fechaCompra, anyosAntiguedad,
            tipo, kilometrosTotales, alimentacion, precio, nuevo,
            gastoPorKm, conductorDni, averiaId, imagenes
        } = await request.json();

        if (!matricula || !marca || !modelo || !fechaCompra || !anyosAntiguedad ||
            !tipo || kilometrosTotales === undefined || !alimentacion ||
            nuevo === undefined || gastoPorKm === undefined) {
            return NextResponse.json(
                { error: "Missing data" },
                { status: 400 }
            );
        }

        const data = {
            matricula,
            marca,
            modelo,
            fechaCompra: new Date(fechaCompra),
            anyosAntiguedad,
            tipo,
            kilometrosTotales,
            alimentacion,
            precio: precio || 0,
            nuevo,
            gastoPorKm,
        };

        if (conductorDni) data.conductorDni = conductorDni;
        if (averiaId) data.averiaId = averiaId;
        if (imagenes && imagenes.length > 0) {
            data.imagen = {
                create: imagenes.map(url => ({ url }))
            };
        }

        const vehiculo = await prisma.vehiculo.create({
            data,
            include: {
                conductor: true,
                averia: true,
                imagen: true,
            },
        });

        return NextResponse.json(vehiculo, { status: 201 });
    } catch (error) {
        console.log(error);
        if (error.code === 'P2002') {
            return NextResponse.json(
                { error: "Ya existe un vehículo con esa matrícula o marca" },
                { status: 409 }
            );
        }
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
