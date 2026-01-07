import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { S3Client, PutObjectCommand, GetObjectCommand } from "npm:@aws-sdk/client-s3";
import { getSignedUrl } from "npm:@aws-sdk/s3-request-presigner";

// Hetzner S3 Configuration (These should be set in Supabase Secrets)
const HETZNER_S3_REGION = Deno.env.get("HETZNER_S3_REGION") || "fsn1";
const HETZNER_S3_ENDPOINT = Deno.env.get("HETZNER_S3_ENDPOINT") || "https://fsn1.your-objectstorage.com";
const HETZNER_S3_ACCESS_KEY = Deno.env.get("HETZNER_S3_ACCESS_KEY");
const HETZNER_S3_SECRET_KEY = Deno.env.get("HETZNER_S3_SECRET_KEY");

const s3Client = new S3Client({
    region: HETZNER_S3_REGION,
    endpoint: HETZNER_S3_ENDPOINT,
    credentials: {
        accessKeyId: HETZNER_S3_ACCESS_KEY || "",
        secretAccessKey: HETZNER_S3_SECRET_KEY || "",
    },
    forcePathStyle: true, // Often required for non-AWS S3 providers
});

const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
    if (req.method === "OPTIONS") {
        return new Response("ok", { headers: corsHeaders });
    }

    try {
        const { action, bucket, fileName, contentType } = await req.json();

        if (!action || !bucket || !fileName) {
            return new Response(JSON.stringify({ error: "Missing required parameters" }), {
                status: 400,
                headers: { ...corsHeaders, "Content-Type": "application/json" },
            });
        }

        if (action === "GET-UPLOAD-URL") {
            // Generate a presigned URL for uploading (PUT)
            const command = new PutObjectCommand({
                Bucket: bucket,
                Key: fileName,
                ContentType: contentType || "application/octet-stream",
            });

            const url = await getSignedUrl(s3Client, command, { expiresIn: 3600 }); // Valid for 1 hour

            return new Response(JSON.stringify({ url }), {
                headers: { ...corsHeaders, "Content-Type": "application/json" },
            });
        }

        if (action === "GET-DOWNLOAD-URL") {
            // Generate a presigned URL for downloading (GET)
            const command = new GetObjectCommand({
                Bucket: bucket,
                Key: fileName,
            });

            const url = await getSignedUrl(s3Client, command, { expiresIn: 3600 }); // Valid for 1 hour

            return new Response(JSON.stringify({ url }), {
                headers: { ...corsHeaders, "Content-Type": "application/json" },
            });
        }

        return new Response(JSON.stringify({ error: "Invalid action" }), {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
    } catch (error) {
        return new Response(JSON.stringify({ error: error.message }), {
            status: 500,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
    }
});
