"use client";

interface LoaderProps {
  size?: "sm" | "md" | "lg";
}

export const Loader = ({ size = "md" }: LoaderProps) => {
  const sizes = {
    sm: "w-4 h-4 border-2",
    md: "w-8 h-8 border-4",
    lg: "w-12 h-12 border-4",
  };

  return (
    <div className="flex justify-center items-center">
      <div
        className={`animate-spin rounded-full border-t-transparent border-blue-500 ${sizes[size]}`}
      />
    </div>
  );
};