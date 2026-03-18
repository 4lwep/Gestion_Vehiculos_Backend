import { NextResponse } from "next/server";
import cloudinary from "@/lib/cloudinary";
import jwt from "jsonwebtoken";
import prisma from "@/lib/prisma";



const FOLDER = 'shop';



export async function GET(request) {

    const limit = +request.nextUrl.searchParams.get("limit") || 10;

    const result = await cloudinary.api.resources_by_asset_folder(FOLDER, {
        max_results: limit
    })

    return NextResponse.json(
        result.resources,
        { status: 200 }
    )
}




export async function POST(request) {
    const authHeader = request.headers.get("Authorization");

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
                    asset_folder: FOLDER,
                    format: 'webp',
                    aspect_ratio: '1',
                    crop: 'fill',
                    width: 852,
                    gravity: "center",
                    invalidate: true,
                    use_filename: true,
                    unique_filename: true, // public ID: false -> imagename, true -> imagename_z7ybio
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