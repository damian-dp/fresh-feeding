import { motion } from "framer-motion";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";

const testimonials = [
    {
        quote: "Fresh Feeding has transformed how we feed our dogs. The recipe builder is amazing!",
        author: "Sarah Johnson",
        role: "Dog Parent",
        pets: "2 German Shepherds",
        avatar: "/avatars/sarah.jpg",
    },
    {
        quote: "The nutrient tracking capabilities have helped me ensure my dogs get balanced meals.",
        author: "Michael Chen",
        role: "Dog Parent",
        pets: "Golden Retriever",
        avatar: "/avatars/michael.jpg",
    },
    {
        quote: "Best raw feeding app we've ever used. The interface is intuitive and features are powerful.",
        author: "Emily Rodriguez",
        role: "Dog Parent",
        pets: "3 Mixed Breeds",
        avatar: "/avatars/emily.jpg",
    },
];

export function TestimonialsGrid() {
    return (
        <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((testimonial, i) => (
                <motion.div
                    key={testimonial.author}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.2 }}
                >
                    <Card>
                        <CardContent className="p-6 space-y-4">
                            <p className="text-lg">{testimonial.quote}</p>
                            <div className="flex items-center gap-4">
                                <Avatar>
                                    <AvatarImage
                                        src={testimonial.avatar}
                                        alt={testimonial.author}
                                    />
                                    <AvatarFallback>
                                        {testimonial.author[0]}
                                    </AvatarFallback>
                                </Avatar>
                                <div>
                                    <p className="font-medium">
                                        {testimonial.author}
                                    </p>
                                    <p className="text-sm text-muted-foreground">
                                        {testimonial.role} • {testimonial.pets}
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>
            ))}
        </div>
    );
}