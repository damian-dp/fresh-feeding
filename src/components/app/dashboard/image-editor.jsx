import { useState, useRef, useEffect, useCallback } from "react";
import AvatarEditor from "react-avatar-editor";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Loader2 } from "lucide-react";
import { Label } from "@/components/ui/label";

const resizeImage = async (blob, maxWidth, maxHeight) => {
    return new Promise((resolve) => {
        const img = new Image();
        img.onload = () => {
            const canvas = document.createElement("canvas");
            let width = img.width;
            let height = img.height;

            // Calculate new dimensions while maintaining aspect ratio
            if (width > maxWidth) {
                height = Math.round((height * maxWidth) / width);
                width = maxWidth;
            }
            if (height > maxHeight) {
                width = Math.round((width * maxHeight) / height);
                height = maxHeight;
            }

            canvas.width = width;
            canvas.height = height;

            const ctx = canvas.getContext("2d");
            ctx.imageSmoothingEnabled = true;
            ctx.imageSmoothingQuality = "high";
            ctx.drawImage(img, 0, 0, width, height);

            // Always try WebP first with 85% quality for avatars, 80% for covers
            canvas.toBlob(
                (webpBlob) => {
                    if (webpBlob) {
                        resolve(webpBlob);
                    } else {
                        // Fallback to JPEG if WebP is not supported
                        canvas.toBlob(
                            (jpegBlob) => resolve(jpegBlob),
                            "image/jpeg",
                            0.9
                        );
                    }
                },
                "image/webp",
                maxWidth === 288 ? 0.85 : 0.8 // 85% quality for avatars, 80% for covers
            );
        };
        img.src = URL.createObjectURL(blob);
    });
};

export function ImageEditorDialog({
    file,
    onSave,
    onCancel,
    aspectRatio,
    shape = "circle",
    borderRadius = 0,
    minZoom = 1,
    maxZoom = 3,
    initialZoom = 1.2,
    allowRotate = true,

    className,
    type,
}) {
    const [scale, setScale] = useState(initialZoom);
    const [rotation, setRotation] = useState(0);
    const [loading, setLoading] = useState(false);
    const [editorSize, setEditorSize] = useState(() => {
        const width = 300;
        const height = aspectRatio ? width / aspectRatio : width;
        return { width, height };
    });
    const editorRef = useRef(null);
    const containerRef = useRef(null);

    // Update editor size based on container width
    useEffect(() => {
        if (!containerRef.current) return;

        const updateSize = () => {
            const containerRect = containerRef.current.getBoundingClientRect();
            const availableWidth = containerRect.width;

            // Base width calculation
            let width = Math.min(availableWidth - 48, 800); // subtract padding

            // Calculate height based on aspect ratio
            let height = aspectRatio ? width / aspectRatio : width;

            // If height is too large, constrain by height instead
            const maxHeight = window.innerHeight * 0.6; // 60% of viewport height
            if (height > maxHeight) {
                height = maxHeight;
                width = height * aspectRatio;
            }

            setEditorSize({ width, height });
        };

        // Initial size
        updateSize();

        // Update size on window resize
        const resizeObserver = new ResizeObserver(updateSize);
        resizeObserver.observe(containerRef.current);

        return () => {
            if (containerRef.current) {
                resizeObserver.unobserve(containerRef.current);
            }
        };
    }, [aspectRatio]);

    const handleSave = useCallback(async () => {
        if (editorRef.current) {
            setLoading(true);
            try {
                // Get initial JPEG from editor with lower quality
                const dataUrl = editorRef.current
                    .getImage()
                    .toDataURL("image/jpeg", 0.8); // Reduced initial quality

                // Convert data URL to blob
                const response = await fetch(dataUrl);
                const initialBlob = await response.blob();

                console.log("Initial blob type:", initialBlob.type);

                // Create an image from the blob
                const img = new Image();
                await new Promise((resolve) => {
                    img.onload = resolve;
                    img.src = URL.createObjectURL(initialBlob);
                });

                // Create canvas for final processing
                const canvas = document.createElement("canvas");
                const ctx = canvas.getContext("2d", {
                    alpha: false,
                    willReadFrequently: true, // Optimization for multiple operations
                });

                // Calculate dimensions - More aggressive reduction
                let width = img.width;
                let height = img.height;

                if (type === "avatar") {
                    // For avatars, force exact dimensions
                    width = 288;
                    height = 288;
                } else {
                    // For covers, more aggressive scaling
                    const targetWidth = 1246; // Max display width
                    const targetHeight = 288; // Fixed height

                    // Scale to fit these dimensions
                    const scale = Math.min(
                        targetWidth / width,
                        targetHeight / height
                    );
                    width = Math.round(width * scale);
                    height = Math.round(height * scale);
                }

                // Resize canvas to new dimensions
                canvas.width = width;
                canvas.height = height;

                // Fill with white background
                ctx.fillStyle = "#FFFFFF";
                ctx.fillRect(0, 0, width, height);

                // Draw with high-quality settings
                ctx.imageSmoothingEnabled = true;
                ctx.imageSmoothingQuality = "high";
                ctx.drawImage(img, 0, 0, width, height);

                // Try WebP first, fallback to JPEG with more aggressive compression
                const finalBlob = await new Promise((resolve) => {
                    canvas.toBlob(
                        (webpBlob) => {
                            if (webpBlob) {
                                const processedBlob = new Blob([webpBlob], {
                                    type: "image/webp",
                                });
                                console.log(
                                    "Final WebP type:",
                                    processedBlob.type,
                                    "Size (KB):",
                                    Math.round(processedBlob.size / 1024),
                                    "Dimensions:",
                                    `${width}x${height}`
                                );
                                resolve(processedBlob);
                            } else {
                                canvas.toBlob(
                                    (jpegBlob) => {
                                        const processedBlob = new Blob(
                                            [jpegBlob],
                                            {
                                                type: "image/jpeg",
                                            }
                                        );
                                        console.log(
                                            "Final JPEG type:",
                                            processedBlob.type,
                                            "Size (KB):",
                                            Math.round(
                                                processedBlob.size / 1024
                                            ),
                                            "Dimensions:",
                                            `${width}x${height}`
                                        );
                                        resolve(processedBlob);
                                    },
                                    "image/jpeg",
                                    type === "avatar" ? 0.8 : 0.85 // Increased quality for covers
                                );
                            }
                        },
                        "image/webp",
                        type === "avatar" ? 0.2 : 0.4 // Increased quality for covers
                    );
                });

                onSave(finalBlob);
            } catch (error) {
                console.error("Error processing image:", error);
            } finally {
                setLoading(false);
            }
        }
    }, [onSave, type]);

    return (
        <Dialog open={!!file} onOpenChange={() => onCancel()}>
            <DialogContent className={className || "sm:max-w-[325px]"}>
                <DialogHeader className="h-16">
                    <DialogTitle className="text-lg font-regular">
                        Crop image
                    </DialogTitle>
                    <DialogDescription className="hidden">
                        Adjust the image to your liking
                    </DialogDescription>
                </DialogHeader>
                <div className="flex flex-col gap-6 p-6 pt-5 px-4">
                    <div
                        ref={containerRef}
                        className="flex justify-center w-full overflow-hidden"
                    >
                        <AvatarEditor
                            ref={editorRef}
                            image={file}
                            width={editorSize.width}
                            height={editorSize.height}
                            border={24}
                            borderRadius={
                                shape === "circle"
                                    ? editorSize.width / 2
                                    : borderRadius
                            }
                            color={[225, 225, 225, 0.5]}
                            scale={scale}
                            rotate={allowRotate ? rotation : 0}
                            crossOrigin="anonymous"
                            className="border-2 rounded-md"
                            style={{
                                maxWidth: "100%",
                                height: "auto",
                            }}
                        />
                    </div>
                    <div className="space-y-4">
                        <div className="space-y-4 pb-3 px-2">
                            <Label className="">Zoom</Label>
                            <Slider
                                value={[scale]}
                                onValueChange={([value]) => setScale(value)}
                                min={minZoom}
                                max={maxZoom}
                                step={0.1}
                            />
                        </div>
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="ghost" onClick={onCancel}>
                        Cancel
                    </Button>
                    <Button
                        variant="outline"
                        onClick={handleSave}
                        disabled={loading}
                    >
                        {loading ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Saving...
                            </>
                        ) : (
                            "Save"
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
