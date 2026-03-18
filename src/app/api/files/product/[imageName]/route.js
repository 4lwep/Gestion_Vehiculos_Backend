import { NextResponse } from "next/server";
import cloudinary from "@/lib/cloudinary";
import path from "node:path";
import jwt from "jsonwebtoken";
import prisma from "@/lib/prisma";

const FOLDER = 'shop';


export async function GET(request, { params }) {
    const { imageName } = await params
    const publicId = path.parse(imageName).name;

    try {
        const result = await cloudinary.api.resource(publicId);
        const res = await fetch(result.secure_url);

        if (!res.ok) {
            return NextResponse.json(
                { error: "No se pudo obtener la imagen" },
                { status: 500 }
            );
        }

        const buffer = await res.arrayBuffer();

        return new NextResponse(buffer, {
            status: 200,
            headers: {
                "Content-Type": res.headers.get("content-type") || "image/" + result.format,
                "Cache-Control": "public, max-age=86400",
            },
        });

    } catch (e) {
        if (e.error.http_code === 404) {
            return NextResponse.json(
                { error: "Image not found" },
                { status: 404 }
            );
        }

        return NextResponse.json(
            { error: e.error.message },
            { status: e.error.http_code }
        );
    }
}




export async function PUT(request, { params }) {
    const authHeader = request.headers.get("Authorization");
    const { imageName } = await params
    const publicId = path.parse(imageName).name;

    if (!authHeader) {
        return NextResponse.json(
            { error: "Forbidden" },
            { status: 403 }
        );
    }

    const token = authHeader.split(' ')[1] || authHeader;

    try {
        // VERIFICAMOS TOKEN
        const { id } = jwt.verify(token, process.env.JWT_SECRET);
        const user = await prisma.user.findUnique({ where: { id } });

        if (!user) {
            return NextResponse.json(
                { error: "Unauthorized. Token expired or invalid." },
                { status: 401 }
            );
        }

        const arrayBuffer = await request.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        if (buffer.length === 0) {
            return NextResponse.json(
                { error: "Image is required" },
                { status: 400 }
            );
        }

        const result = await new Promise((resolve, reject) => {
            cloudinary.uploader.upload_stream(
                {
                    public_id: publicId,
                    asset_folder: FOLDER,
                    format: 'webp',
                    aspect_ratio: '1',
                    crop: 'fill',
                    width: 852,
                    gravity: "center",
                    invalidate: true,
                },
                (error, result) => {
                    if (error) {
                        reject(error);
                    } else {
                        resolve(result);
                    }
                }
            ).end(buffer);
        });

        return NextResponse.json(
            result,
            { status: 201 }
        );

    } catch (error) {
        console.error(error);
        if (error.name === 'TokenExpiredError' || error.name === 'JsonWebTokenError') {
            return NextResponse.json(
                { error: "Unauthorized. Token invalid or expired." },
                { status: 401 }
            );
        }
        return NextResponse.json(
            { error: error.message || "Internal server error" },
            { status: 500 }
        );
    }
}



export async function DELETE(request, { params }) {
    const authHeader = request.headers.get("Authorization");
    const { imageName } = await params
    const publicId = path.parse(imageName).name;

    if (!authHeader) {
        return NextResponse.json(
            { error: "Forbidden" },
            { status: 403 }
        );
    }

    const token = authHeader.split(' ')[1] || authHeader;

    try {
        // VERIFICAMOS TOKEN
        const { id } = jwt.verify(token, process.env.JWT_SECRET);
        const user = await prisma.user.findUnique({ where: { id } });

        if (!user) {
            return NextResponse.json(
                { error: "Unauthorized. Token expired or invalid." },
                { status: 401 }
            );
        }

        await cloudinary.uploader.destroy(publicId, { invalidate: true });
        return NextResponse.json(
            { message: "Image deleted successfully" },
            { status: 200 }
        );
    } catch (error) {
        console.error(error);
        if (error.name === 'TokenExpiredError' || error.name === 'JsonWebTokenError') {
            return NextResponse.json(
                { error: "Unauthorized. Token invalid or expired." },
                { status: 401 }
            );
        }
        return NextResponse.json(
            { error: error.message || "Internal server error" },
            { status: 500 }
        );
    }
}

