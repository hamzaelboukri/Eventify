import React from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import type { Category } from "@/types";

interface CategoryCardProps {
  category: Category;
  className?: string;
}

export const CategoryCard: React.FC<CategoryCardProps> = ({ category, className }) => {
  return (
    <Link href={`/categories/${category.slug}`}>
      <div
        className={cn(
          "bg-slate-800/50 backdrop-blur-sm rounded-2xl p-6",
          "text-center border border-slate-700/50",
          "hover:bg-primary-900/30 hover:border-primary-500/50",
          "transition-all duration-300 cursor-pointer group",
          className
        )}
      >
        <div className="text-4xl mb-3">{category.icon}</div>
        <h3 className="text-white font-semibold group-hover:text-primary-500 transition-colors">
          {category.name}
        </h3>
        <p className="text-slate-500 text-sm mt-1">{category.count} events</p>
      </div>
    </Link>
  );
};

export default CategoryCard;
