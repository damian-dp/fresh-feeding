# Fresh Food Feeding

A modern web application that helps dog owners create and manage balanced raw food diets for their pets. Built with React, Supabase, and modern web technologies.

![Fresh Food Feeding Logo](./src/assets/images/logo.svg)

## 🌟 Features

-   **Dog Profile Management**

    -   Create and manage multiple dog profiles
    -   Track weight, age, breed, and dietary requirements
    -   Automatic calculation of nutritional needs based on dog characteristics

-   **Recipe Creation & Management**

    -   Build custom raw food recipes
    -   Real-time nutritional analysis
    -   Save and organize recipes by dog
    -   Verify recipe balance against BARF principles

-   **Ingredient Database**

    -   Comprehensive database of raw feeding ingredients
    -   Detailed nutritional information
    -   Categorized ingredients (muscle meat, organs, vegetables, etc.)
    -   Bone content tracking

-   **Smart Recommendations**
    -   Personalized feeding recommendations
    -   Nutritional balance warnings
    -   Portion size calculations

## 🏗️ Tech Stack

-   **Frontend**

    -   React 18 with Vite
    -   React Router for navigation
    -   Zustand for state management
    -   Shadcn UI & Radix UI for components
    -   Tailwind CSS for styling

-   **Backend**

    -   Supabase for:
        -   PostgreSQL database
        -   Authentication
        -   Row Level Security
        -   Edge Functions

-   **Email**

    -   Resend
    -   React Email

-   **Deployment**
    -   Vercel

## 🔒 Security

-   JWT-based authentication via Supabase
-   Row Level Security (RLS) policies for data protection
-   Input sanitisation
-   Secure session management
