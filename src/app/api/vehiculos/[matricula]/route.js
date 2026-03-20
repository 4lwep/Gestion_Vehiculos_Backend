import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";



export async function GET(request, { params }) {
    const { matricula } = await params;

    try {
        const vehiculo = await prisma.vehiculo.findUnique({
            where: { matricula },
            include: {
                conductor: true,
                averia: true,
                imagen: true,
            },
        });

        if (!vehiculo) {
            return NextResponse.json(
                { message: "Vehículo not found" },
                { status: 404 }
            );
        }

        return NextResponse.json(vehiculo, { status: 200 });
    } catch (error) {
        console.log(error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}



export async function PATCH(request, { params }) {
    const { matricula } = await params;
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

        const existing = await prisma.vehiculo.findUnique({ where: { matricula } });
        if (!existing) {
            return NextResponse.json(
                { message: "Vehículo not found" },
                { status: 404 }
            );
        }

        const body = await request.json();
        const {
            marca, modelo, fechaCompra, anyosAntiguedad, tipo,
            kilometrosTotales, alimentacion, precio, nuevo,
            gastoPorKm, conductorDni, averiaId, imagenes
        } = body;

        const data = {};
        if (marca !== undefined) data.marca = marca;
        if (modelo !== undefined) data.modelo = modelo;
        if (fechaCompra !== undefined) data.fechaCompra = new Date(fechaCompra);
        if (anyosAntiguedad !== undefined) data.anyosAntiguedad = anyosAntiguedad;
        if (tipo !== undefined) data.tipo = tipo;
        if (kilometrosTotales !== undefined) data.kilometrosTotales = kilometrosTotales;
        if (alimentacion !== undefined) data.alimentacion = alimentacion;
        if (precio !== undefined) data.precio = precio;
        if (nuevo !== undefined) data.nuevo = nuevo;
        if (gastoPorKm !== undefined) data.gastoPorKm = gastoPorKm;
        if (conductorDni !== undefined) data.conductorDni = conductorDni;
        if (averiaId !== undefined) data.averiaId = averiaId;
        if (imagenes !== undefined) {
            data.imagen = {
                connectOrCreate: imagenes.map(url => ({
                    where: { url },
                    create: { url }
                }))
            };
        }

        const updated = await prisma.vehiculo.update({
            where: { matricula },
            data,
            include: {
                conductor: true,
                averia: true,
                imagen: true,
            },
        });

        return NextResponse.json(updated, { status: 200 });
    } catch (error) {
        console.log(error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}



export async function DELETE(request, { params }) {
    const { matricula } = await params;
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

        const existing = await prisma.vehiculo.findUnique({ where: { matricula } });
        if (!existing) {
            return NextResponse.json(
                { message: "Vehículo not found" },
                { status: 404 }
            );
        }

        const deleted = await prisma.vehiculo.delete({
            where: { matricula },
            include: {
                imagen: true,
            },
        });

        return NextResponse.json(deleted, { status: 200 });
    } catch (error) {
        console.log(error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
