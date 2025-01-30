import { useState, useRef, useEffect } from "react";
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

export function ImageEditorDialog({
    file,
    onSave,
    onCancel,
    title = "Edit Image",
    aspectRatio,
    shape = "circle",
    borderRadius = 0,
    minZoom = 1,
    maxZoom = 3,
    initialZoom = 1.2,
    allowRotate = true,
    quality = 1,
    mimeType = "image/jpeg",
    className,
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

    const handleSave = async () => {
        if (editorRef.current) {
            setLoading(true);
            try {
                const canvas = editorRef.current.getImage();
                const croppedImage = await new Promise((resolve) => {
                    canvas.toBlob(
                        (blob) => {
                            resolve(blob);
                        },
                        mimeType,
                        quality
                    );
                });
                onSave(croppedImage);
            } catch (error) {
                console.error("Error saving image:", error);
            } finally {
                setLoading(false);
            }
        }
    };

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
